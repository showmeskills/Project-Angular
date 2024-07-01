#!/bin/bash

source merchant_scripts/yaml.sh

# 读取配置
create_variables "$1"

replace_android_bundle_id() {
   # 替换安卓包名
   # shellcheck disable=SC2016
   grep -rl "${android_bundle_id}" android | xargs sed -i "" "s/${android_bundle_id}/${app_config_bundle_id}/g"
}

replace_ios_bundle_id() {
   # 替换 iOS 包名
   grep -rl "${ios_bundle_id}" ios | xargs sed -i "" "s/${ios_bundle_id}/${app_config_bundle_id_ios}/g"
   # 替换 iOS 打包配置里面的包名
   grep -rl "{bundle_id_to_be_replaced}" merchant_scripts/sources | xargs sed -i "" "s/{bundle_id_to_be_replaced}/${app_config_bundle_id_ios}/g"
}

replace_scheme_id() {
   # 替换唤醒app的scheme
   # shellcheck disable=SC2016
   grep -rl "com.gogaming.schemeId" android | xargs sed -i "" "s/com.gogaming.schemeId/${app_config_scheme_id}/g"
   grep -rl "com.gogaming.schemeId" ios | xargs sed -i "" "s/com.gogaming.schemeId/${app_config_scheme_id}/g"
}

replace_display_name() {
   # 替换 iOS 应用名
   /usr/libexec/PlistBuddy -c "Set :CFBundleDisplayName ${app_config_display_name}" ios/Runner/Info.plist
   # 替换 iOS 下载配置里面的应用名
   sed -i '' "s/{display_name_to_be_replaced}/${app_config_display_name}/g" merchant_scripts/sources/ios_app_download.plist
   # 替换 iOS 下载配置里面的安装包名
   sed -i '' "s/{package_name_to_be_replaced}/${app_config_install_package_name_ios}/g" merchant_scripts/sources/ios_app_download.plist
   # 替换安卓应用名
   sed -i '' "s/android:label=\([\'|\"]\)\([^\"]\{1,\}\([\'|\"]\)\)/android:label=\"${app_config_display_name}\"/" android/app/src/main/AndroidManifest.xml
}

replace_merchant_info() {
  # 替换 config 中的商户 id
  sed -i '' "s/tenantId\([ ]\{1,\}\)=\([ ]\{1,\}\)\([\'|\"]\)\([^\"]\{1,\}\([\'|\"]\)\)/tenantId = \"${merchant_config_tenant_id}\"/" lib/config/config.dart
  # 替换 OAuthConfig 中的 line id
  sed -i '' "s/lineID\([ ]\{1,\}\)=\([ ]\{1,\}\)\([\'|\"]\)\([^\"]\{1,\}\([\'|\"]\)\)/lineID = \"${merchant_config_line_id}\"/" lib/common/service/oauth_service/oauth_config.dart
  # 读取谷歌配置里的 REVERSED_CLIENT_ID 用于覆盖 iOS 配置
  google_client_id=$(/usr/libexec/PlistBuddy -c 'Print :REVERSED_CLIENT_ID' "${merchant_config_google_info_path}"GoogleService-Info.plist)
  sed -i '' "s/com.googleusercontent.*<\/string>/${google_client_id}<\/string>/g" ios/Runner/Info.plist
  # 读取谷歌配置直接覆盖
  # shellcheck disable=SC2224
  mv -f "${merchant_config_google_info_path}"GoogleService-Info.plist ios/Runner/GoogleService-Info.plist
  mv -f "${merchant_config_google_info_path}"google-services.json android/app/google-services.json
  # 替换 firebase analytics 中的配置
  if [[ -n "$merchant_config_current_firebase_options" ]];then
    sed -i '' "s/options = .*;/options = ${merchant_config_current_firebase_options};/g" lib/common/tracker/analytics_manager.dart
  fi
  # 替换 config.dart 中的环境变量配置
  sed -i '' "s/_currentConfig = .*;/_currentConfig = ${merchant_config_current_config};/g" lib/config/config.dart
  # 替换 config.dart 中的 languageType
  sed -i '' "s/languageType = .*;/languageType = '${merchant_config_language_type}';/g" lib/config/config.dart
  # 替换 config.dart 中的 isM1
  sed -i '' "s/isM1\([ ]\{1,\}\)=\([ ]\{1,\}\)\([\'|\"]\)\([^\"]\{1,\}\([\'|\"]\)\)/isM1 = \"${merchant_config_is_m1}\"/" lib/config/config.dart
  # 替换 go_gaming_colors.dart 中的 GGColors别名
  sed -i '' "s/typedef GGColors = .*;/typedef GGColors = ${merchant_config_colors};/g" lib/common/theme/colors/go_gaming_colors.dart
}

load_ios_bundle_id() {
  # 获取当前 iOS 包名
  ios_bundle_id=$(sed -n '/PRODUCT_BUNDLE_IDENTIFIER/{s/PRODUCT_BUNDLE_IDENTIFIER = //;s/;//;s/^[[:space:]]*//;p;q;}' ios/Runner.xcodeproj/project.pbxproj)
}

load_android_bundle_id() {
  # 获取安卓当前包名
  load_android_package_id=$(awk "/package=\"/" android/app/src/main/AndroidManifest.xml)
  temp_android="${load_android_package_id#*\"}"
  android_bundle_id="${temp_android%\"*}"
}

replace_sentry_config() {
  # 替换sentry dsn
  sed -i '' "s/https:\/\/28012dbc8729b090190555b9704a7b81@sentry.athena25.com\/5/${merchant_config_sentry_dsn}/g" lib/config/config.dart
  # 替换sentry project
  # sed -i '' "s/project\([ ]\{1,\}\):\([ ]\{1,\}\)\([\'|\"]\)\([^\"]\{1,\}\([\'|\"]\)\)/project : \"${merchant_config_sentry_project}\"/" pubspec.yaml
}

replace_shorebird_id() {
  # 替换 shorebird appid
  sed -i '' "s/app_id: .*/app_id: ${app_config_shorebird_id}/g" shorebird.yaml
}

load_android_bundle_id
replace_android_bundle_id

replace_scheme_id

replace_sentry_config
replace_shorebird_id

load_ios_bundle_id
replace_ios_bundle_id

replace_display_name
replace_merchant_info
