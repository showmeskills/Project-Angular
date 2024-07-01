import 'package:base_framework/base_framework.dart';
import 'package:gogaming_app/common/api/base/go_gaming_service.dart';
import 'package:gogaming_app/common/service/account_service.dart';
import 'package:gogaming_app/common/service/h5_webview_manager.dart';
import 'package:gogaming_app/common/service/merchant_service/merchant_config_model.dart';
import 'package:gogaming_app/common/service/merchant_service/merchant_service.dart';
import 'package:gogaming_app/common/service/web_url_service/web_url_service.dart';
import 'package:gogaming_app/config/config.dart';
import 'package:gogaming_app/router/app_pages.dart';

import 'live_chat_config.dart';

class CustomerServiceLogic extends GetxController {
  final comm100Url = ''.obs;

  MerchantCustomConfig? model;

  LiveChatConfig get config {
    final accountService = AccountService();
    final isLogin = accountService.isLogin;
    final lang = GoGamingService().apiLang;
    final userName = isLogin ? accountService.gamingUser?.userName : '';
    final uid = isLogin ? accountService.gamingUser?.uid : '';
    final email = isLogin ? accountService.gamingUser?.email : null;
    const appVersion = Config.versionName;
    // final lisence = model?.comm100SiteId ?? '17498976';
    final customerName = userName ?? email ?? uid ?? '';
    final customerEmail = email ?? '';
    return LiveChatConfig(name: customerName, email: customerEmail, params: {
      'lang': lang,
      'version': appVersion,
      'username': customerName,
      'uid': uid
    });
  }

  @override
  void onInit() {
    super.onInit();
    MerchantService().getMerchantConfig().listen((event) {
      if (event != null) {
        model = event.config;
        // https://secure.livechatinc.com/licence/17498976/v2/open_chat.cgi?group=22&name=22222&email=2222@test.com&params=test%3D789%26test2%3D123456
        final livechatConfig = config;
        final chatLiveUrl =
            '${model?.chatLiveUrl ?? ''}&name=${livechatConfig.name}&email=${livechatConfig.email}&params=${livechatConfig.paramsUrlEncode}';

        comm100Url.value = chatLiveUrl;
      }
    });
  }

  String chatLiveJS() {
    final accountService = AccountService();
    final isLogin = accountService.isLogin;
    final lang = GoGamingService().apiLang;
    final userName = isLogin ? accountService.gamingUser?.userName : '';
    final uid = isLogin ? accountService.gamingUser?.uid : '';
    final email = isLogin ? accountService.gamingUser?.email : null;
    const appVersion = Config.versionName;
    // final lisence = model?.comm100SiteId ?? '17498976';
    final customerName = userName ?? email ?? uid ?? '';
    final customerEmail = email ?? '';
    String chatLiveScript = '''
  
    //设置viewport=1
    window.addEventListener('load', function() {
      var viewportTag = document.querySelector('meta[name=viewport]');
      if (viewportTag) {
        viewportTag.content = "width=device-width, initial-scale=1, shrink-to-fit=no";
      } else {
        viewportTag = document.createElement('meta');
        viewportTag.name = 'viewport';
        viewportTag.content = "width=device-width, initial-scale=1, shrink-to-fit=no";
        document.getElementsByTagName('head')[0].appendChild(viewportTag);
      }

      window.LiveChatWidget = window.LiveChatWidget||{};

      // window.LiveChatWidget.on('ready', onReady);
    });

    var timer = setTimeout(checkAndNotify, 200);
    function checkAndNotify() {
      if (window.LiveChatWidget && 'call' in window.LiveChatWidget) {
        window.LiveChatWidget.call('set_customer_name', 'test@zac.com');
        window.LiveChatWidget.call('set_customer_email', 'test@qq.com');
        // const customer_name = "$customerName";
        // const customer_email = "$customerEmail";

        // const lang = "$lang";
        // const appVersion = "$appVersion";
        // const username = "$userName";
        // const uid = "$uid";
        // const comm100Variables = {
        //   'lang': lang,
        //   'version': appVersion,
        //   'username': username,
        //   'uid': uid
        // };
        // window.LiveChatWidget.call('set_customer_name', customer_name);
        // window.LiveChatWidget.call('set_customer_email', customer_email);
        // window.LiveChatWidget.call('set_session_variables', comm100Variables);
        timer && clearTimeout(timer);
      }
    }

  ''';

    return chatLiveScript;
  }

  String comm100JS() {
    final accountService = AccountService();
    final isLogin = accountService.isLogin;
    final lang = GoGamingService().apiLang;
    final userName = isLogin ? accountService.gamingUser?.userName : null;
    final uid = isLogin ? accountService.gamingUser?.uid : null;
    final siteId = model?.comm100SiteId ?? '';
    final campaignId = model?.campaignId ?? '';
    final id = 'livechat-button-$campaignId';
    const appVersion = Config.versionName;

    String comm100Script = '''
    const divEl = document.createElement('div');
    divEl.id = $id;
    document.body.appendChild(divEl);
    window.LiveChatAPI = window.LiveChatAPI||{};
    (function(t){
      function e(e){
        var a=document.createElement("script"),c=document.getElementsByTagName("script")[0];
        a.type="text/javascript";
        a.async=!0;
        a.src=e+t.site_id;
        c.parentNode.insertBefore(a,c);
      }
      t.chat_buttons=t.chat_buttons||[];
      t.chat_buttons.push({code_plan: $campaignId,div_id:"livechat-button-$campaignId"});
      t.site_id=$siteId;
      t.main_code_plan=$campaignId;
      e("https://vue.ooooooo2.online/livechat.ashx?siteId=");
      setTimeout(function(){
        t.loaded||e("https://vue.ooooooo2.online/livechat.ashx?siteId=")
      },5e3)
      })(window.LiveChatAPI||{});

    var timer = setTimeout(checkAndNotify, 200);
    function checkAndNotify() {
      if (window.LiveChatAPI && 'set' in window.LiveChatAPI) {
          const comm100Variables = [
          //语言
          {
            name: 'lang',
            value: $lang,
          },
          {
            name: 'VisitorDomain',
            value: 'sit.newplatform.gbfine.com',
          },
                    {
            name: 'appVersion',
            value: $appVersion,
          },
        ];
        if ($isLogin) {
          //用户名
          comm100Variables.push({
            name: 'username',
            value: $userName,
          });
          //UID
          comm100Variables.push({
            name: 'uid',
            value: $uid,
          });
        }
        window.LiveChatAPI.set('livechat.customVariables', comm100Variables);
        timer && clearTimeout(timer);
      }
    }

''';
    return comm100Script;
  }

  Future<bool?> handleNewWindow(InAppWebViewController controller,
      CreateWindowAction createWindowAction) async {
    final url = createWindowAction.request.url;
    // "https://zh-cn/promotions/offer/B1412767032593605" 处理这种异常格式的跳转
    if (url != null && !url.host.contains('.')) {
      final fixWebUrl = WebUrlService.url2(url.path);

      H5WebViewManager.sharedInstance.openWebView(
        url: fixWebUrl,
      );
      return false;
    } else {
      Get.toNamed<void>(
        Routes.webview.route,
        arguments: {
          'windowId': createWindowAction.windowId,
        },
        preventDuplicates: false,
      );
      return true;
    }
  }

// @override
// void onReady() {
//   // TODO: implement onReady
//   super.onReady();
// }
//
// @override
// void onClose() {
//   // TODO: implement onClose
//   super.onClose();
// }
}
