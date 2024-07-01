import requests, json, os
import pandas as pd
from pandas import ExcelWriter
from datetime import datetime

translate_path = 'lib/translate'
translate_control_map = {
    "zh": "zh-cn",
    "en": "en-us",
    "th": "th",
    "vi": "vi",
    "tr": "tr",
    "pt": "pt-br",
    "ja": "ja",
}

sit_url = "https://sit-newplatform.mxsyl.com/configs3/LanguageTranslate/App/"
pro_url = "https://www.lt.com/configs3/LanguageTranslate/App/"

# 获取当前环境
def get_current_env() -> str:
    work_file = os.getcwd()
    with open(os.path.join(work_file, 'lib/config/config.dart'), "r") as file:
        for line in file.readlines():
            line = line.strip()
            if (line.startswith('static final Config _currentConfig') and 'Pro.config' in line):
                return 'Pro'
        return 'Sit'
    
# 遍历文件，返回文件名
def traverse_folder(folder_path):
    for root, _, files in os.walk(folder_path):
        for file in files:
            yield os.path.join(root, file)

# 获取本地翻译文件
def get_local_translate(file_path: str, status: str) -> dict:
    with open(file_path, "r") as file:
        file_content = file.read()
        file_content = file_content.replace('const Map<String, dynamic> ' + status + 'Translate = ', '')
        file_content = file_content.replace('\\$', '$')
        file_content = file_content.replace('};', '}')
        return json.loads(file_content)

# 请求翻译文件
def request_translate_json(url: str) -> dict:
    try:
        r = requests.get(url)
        if (r.status_code == 200):
            data = json.loads(r.text)
            if (isinstance(data, dict)):
                return data
    except requests.exceptions.RequestException as e:
        print(e)
    return {}

# 对比本地翻译文件
def compare_translate_json(local: dict, remote: dict) -> dict:
    result_dict = {}
    if (isinstance(local, dict)):
        local_tran_dict = local
        for key in local_tran_dict.keys():
            if key not in remote.keys():
                result_dict[key] = local_tran_dict[key]

    return result_dict

# 写入 xlsx
def write_xlsx(datas: list, xlsx_name: str):
    # 获取 xlsx 最大行数
    tmp_list = []
    for map in datas:
        for map_keys in map.values():
            tmp_list.extend(list(map_keys.keys()))

    write_xlsx_data = []
    for key in set(tmp_list):
        map = {}
        map['Key'] = key
        map['Type'] = 8
        for m in datas:
            if key in m[list(m.keys())[0]]:
                map[translate_control_map[list(m.keys())[0]]] = m[list(m.keys())[0]][key]
            else:
                map[translate_control_map[list(m.keys())[0]]] = ''
        write_xlsx_data.append(map)

    with ExcelWriter(xlsx_name) as writer:
        df = pd.DataFrame(write_xlsx_data)
        df.to_excel(writer, sheet_name="Sheet1", index=False, engine="openpyxl")

# main
if __name__ == '__main__':
    print('Export translate start')
    is_pro = get_current_env() == 'Pro'
    datas = []
    for file_path in traverse_folder(os.path.join(os.getcwd(), translate_path)):
        result_map = {}
        basename, _ = os.path.splitext(os.path.basename(file_path))
        translate_status = basename[-2:]

        local_translate_map = get_local_translate(file_path, translate_status)
        request_host = pro_url if is_pro == True else sit_url
        remote_translate_map = request_translate_json(request_host + translate_control_map[translate_status] + '.json')
        print('Download translate json with url:' + request_host + translate_control_map[translate_status] + '.json')
        result_map[translate_status] = compare_translate_json(local_translate_map, remote_translate_map)
        datas.append(result_map)

    xlsx_name = datetime.today().strftime('%Y%m%d-%S')
    write_xlsx(datas, xlsx_name + '.xlsx')
    print('Export translate end')
