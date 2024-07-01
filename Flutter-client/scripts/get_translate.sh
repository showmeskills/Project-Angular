#!/bin/bash

translate_file_list=("zh-cn.json" "en-us.json" "th.json" "vi.json" "tr.json" "pt-br.json" "ja.json")
source_url="https://sit-newplatform.mxsyl.com/configs3/LanguageTranslate/App/"

reset() {
  if [[ -e lib/translate/ ]]; then
      rm -rf lib/translate/
  fi
  mkdir lib/translate/
  for f in "${translate_file_list[@]}"
  do
    touch lib/translate/translate_${f:0:2}.dart
  done
}

get_env() {
  string=$(grep '_currentConfig = .*;' lib/config/config.dart | awk '{print substr($0, length($0)-10)}')
  if [[ $string == "Pro.config;" ]]; then
    source_url='https://www.lt.com/configs3/LanguageTranslate/App/'
  fi
  echo "Use ${source_url} download translate json"
}

download() {
  for f in "${translate_file_list[@]}"
  do
    curl -sb -H "Accept: application/json" "${source_url}${f}" | jq -r "." > lib/translate/translate_${f:0:2}.dart
    sed -i '' "1s/{/const Map<String, dynamic> ${f:0:2}Translate = {/" lib/translate/translate_${f:0:2}.dart
    # 处理转义
    sed -i '' 's/\$ /\$/g' lib/translate/translate_${f:0:2}.dart
    sed -i '' 's/\$/\\$/g' lib/translate/translate_${f:0:2}.dart
    sed -i '' '$s/.*/};/g' lib/translate/translate_${f:0:2}.dart
  done
}

echo "Start get translate"
reset
get_env
download
echo "End get translate"