#!/bin/bash

device_version=$1
source_branch=$2
source_commit_id=$3

config_git() {
  git config --global user.name jari
  git config --global user.email jari@gbd.com
  git checkout -b ${source_branch}
  git pull origin ${source_branch}
}

change_device_version() {
  # set_version 为类似 3.20240229.0+320240229 的值
  set_version="3.${device_version}+3${device_version%.*}"
  sed -i '' "s/version: .*/version: ${set_version}/g" pubspec.yaml
  sed -i '' "s/deviceVersion = .*;/deviceVersion = '${set_version}';/g" lib/config/config.dart
}

push_change_to_git() {
  git add lib/config/config.dart
  git add pubspec.yaml
  git commit -m "feat: Version Change [ci skip]"
  git push --set-upstream origin ${source_branch}
}

reset_git() {
  git checkout .
  git checkout ${source_commit_id}
}

# 配置 git
config_git
# 使用 build.number 修改本地 pubspec.yaml 以及 config.dart 文件中的版本号
# set_version 为类似 3.20240229.0+320240229 的值
change_device_version
# 将改动提交到真实目标分支
push_change_to_git
# pipeline 打包为触发节点，push_change_to_git 执行后会 check 到真实分支
# 这里需要 check 回打包工作分支
reset_git
# 回到打包工作分支后需要再次修改本地 pubspec.yaml 以及 config.dart 文件中的版本号
change_device_version
