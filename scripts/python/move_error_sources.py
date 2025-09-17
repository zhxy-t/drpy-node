#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
移动错误源文件脚本
读取report.json文件，找出status为"error"的数据源，
根据name字段去掉括号后的文件名，在js目录中查找对应的JS文件，
并将其移动到js_bad目录中。
"""

import json
import os
import shutil
import re
from pathlib import Path


def extract_filename_from_name(name):
    """
    从name字段提取文件名，只去掉圆括号及其内容，保留方括号
    例如: "皮皮虾[优](DS)" -> "皮皮虾[优]"
    """
    # 使用正则表达式只去掉圆括号及其内容
    filename = re.sub(r'\(.*?\)', '', name).strip()
    return filename


def find_js_file(js_dir, js_bad_dir, filename):
    """
    在js目录和js_bad目录中查找对应的JS文件
    返回 (文件路径, 状态) 元组
    状态: 'js' - 在js目录, 'js_bad' - 在js_bad目录, 'not_found' - 未找到
    """
    js_dir_path = Path(js_dir)
    js_bad_dir_path = Path(js_bad_dir)
    
    js_file = js_dir_path / f"{filename}.js"
    js_bad_file = js_bad_dir_path / f"{filename}.js"
    
    if js_file.exists():
        return js_file, 'js'
    elif js_bad_file.exists():
        return js_bad_file, 'js_bad'
    else:
        return None, 'not_found'


def move_error_sources():
    """
    主函数：处理错误源文件的移动
    """
    # 定义路径
    base_dir = Path(__file__).parent.parent.parent  # drpy-node目录
    report_file = base_dir / "data" / "source-checker" / "report.json"
    js_dir = base_dir / "spider" / "js"
    js_bad_dir = base_dir / "spider" / "js_bad"

    # 确保js_bad目录存在
    js_bad_dir.mkdir(exist_ok=True)

    print(f"读取报告文件: {report_file}")
    print(f"JS源目录: {js_dir}")
    print(f"JS错误目录: {js_bad_dir}")
    print("-" * 50)

    try:
        # 读取report.json文件
        with open(report_file, 'r', encoding='utf-8') as f:
            report_data = json.load(f)

        sources = report_data.get('sources', [])
        error_count = 0
        moved_count = 0
        already_in_bad_count = 0
        not_found_count = 0

        print(f"总共找到 {len(sources)} 个数据源")

        # 遍历所有源，找出错误的源
        for source in sources:
            if source.get('status') == 'error':
                error_count += 1
                name = source.get('name', '')
                key = source.get('key', '')

                # 提取文件名
                filename = extract_filename_from_name(name)

                print(f"\n处理错误源: {name}")
                print(f"  提取的文件名: {filename}")

                # 查找对应的JS文件
                js_file, status = find_js_file(js_dir, js_bad_dir, filename)

                if status == 'js':
                    # 文件在js目录，需要移动到js_bad目录
                    destination = js_bad_dir / js_file.name

                    try:
                        shutil.move(str(js_file), str(destination))
                        moved_count += 1
                        print(f"  ✓ 已移动: {js_file.name} -> js_bad/")
                    except Exception as e:
                        print(f"  ✗ 移动失败: {e}")
                elif status == 'js_bad':
                    # 文件已经在js_bad目录
                    already_in_bad_count += 1
                    print(f"  ℹ 文件已在js_bad目录: {js_file.name}")
                else:
                    # 两个目录都没有找到文件
                    not_found_count += 1
                    print(f"  ✗ 未找到对应的JS文件（js和js_bad目录都没有）")

        # 输出统计信息
        print("\n" + "=" * 50)
        print("处理完成！统计信息:")
        print(f"  错误源总数: {error_count}")
        print(f"  成功移动: {moved_count}")
        print(f"  已在js_bad目录: {already_in_bad_count}")
        print(f"  未找到文件: {not_found_count}")
        print("=" * 50)

    except FileNotFoundError:
        print(f"错误: 找不到报告文件 {report_file}")
    except json.JSONDecodeError:
        print(f"错误: 无法解析JSON文件 {report_file}")
    except Exception as e:
        print(f"错误: {e}")


if __name__ == "__main__":
    move_error_sources()
