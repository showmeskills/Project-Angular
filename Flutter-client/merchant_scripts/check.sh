#!/bin/bash

# 黑名单
# 如果以 / 结尾则判断是否在该文件夹下，否则判断是否是该文件本身
black_list=("assets/" "ios/" "android/" "pubspec.yaml")

is_full_update=false

# 根据黑名单中文件判断是否需要全量更新
check_change_files() {
  change_files=($(git diff --name-only HEAD~ HEAD))
  for file in "${change_files[@]}"
  do
    if [[ ${#file} -gt 0 && "${file}" == *[^[:space:]]* ]]; then
      for filter_file in "${black_list[@]}"
      do
        if [[ $filter_file == *"/" ]] && [[ $file == $filter_file* ]]; then
          is_full_update=true
          break 2
        elif [[ $file == *$filter_file ]]; then
          is_full_update=true
          break 2
        fi
      done
    fi
  done
}

check_change_files
echo $is_full_update