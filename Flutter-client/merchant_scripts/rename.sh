#!/bin/bash

source merchant_scripts/yaml.sh

# 需要移动并重命名的资源文件
source_file=$1
# 替换的目标文件路径
target_path=$2
# 读取配置
create_variables "$3"

# 获取文件后缀
# shellcheck disable=SC2001
extension=$(echo "$source_file" | sed 's/^.*\.//')

platform_install_package_name=""
if [ "$extension" == "apk" ]; then
  platform_install_package_name=${app_config_install_package_name}
else
  platform_install_package_name=${app_config_install_package_name_ios}
fi

# shellcheck disable=SC2154
echo "$source_file" "${target_path}/""${platform_install_package_name}"".${extension}"
# shellcheck disable=SC2154
mv "$source_file" "${target_path}/""${platform_install_package_name}"".${extension}"
