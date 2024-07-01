// ignore_for_file: unused_element

import '../base/base_api.dart';

enum CryptoAddress with GoGamingApi {
  /// 添加地址
  addAddress(data: {
    "remark": "地址备注",
    "token": null, //币种（为空时是通用地址）
    "network": "网络",
    "address": "提币地址",
    "isWhiteList": false, // "是否添加白名单",
    "key": "用户验证键值"
  }),

  /// 删除加密货币地址
  batchDelete(data: {
    "ids": [1, 2, 3], // 数组类型
    "key": "用户验证键值",
  }),

  /// 批量加入白名单/移出白名单(支持单个)
  batchUpdateWhiteList(data: {
    "ids": [1, 2, 3], // 数组类型
    "key": "用户验证键值",
    "isJoin": false,
  }),

  /// /tokenaddress/addewalletaddress 添加电子钱包地址
  addEWalletAddress(data: {
    "remark": null, //"地址备注"
    "currency": "币种",
    "paymentMethod": "支付方式",
    "address": "提币地址",
    "isWhiteList": false, //"是否添加白名单"
    "key": "用户验证键值"
  }),

  /// 获取数字货币地址
  getTokenAddress(params: {
    "currency": null, //"币种",
    "isWhiteList": null, //bool "是否为白名单地址",
    "isUniversalAddress": null, //bool "是否为通用地址",
    "address": null, // "地址"
    "isWithdraw": null, //bool "是否提现",
    "walletAddressType": null, // int 钱包地址类型
    "paymentMethod": null, // String 电子钱包支付方式
  });

  const CryptoAddress({this.params, this.data});

  @override
  final Map<String, dynamic>? params;
  @override
  final Map<String, dynamic>? data;

  @override
  String get path {
    switch (this) {
      case CryptoAddress.getTokenAddress:
        return "/asset/tokenaddress/gettokenaddress";
      case CryptoAddress.batchDelete:
        return "/asset/tokenaddress/batchdelete";
      case CryptoAddress.addAddress:
        return "/asset/tokenaddress/addtokenaddress";
      case CryptoAddress.batchUpdateWhiteList:
        return "/asset/tokenaddress/batchupdatewhitelist";
      case CryptoAddress.addEWalletAddress:
        return '/asset/tokenaddress/addewalletaddress';
    }
  }

  @override
  HTTPMethod get method {
    switch (this) {
      case CryptoAddress.getTokenAddress:
        return HTTPMethod.get;
      case CryptoAddress.batchDelete:
      case CryptoAddress.addAddress:
      case CryptoAddress.batchUpdateWhiteList:
      case CryptoAddress.addEWalletAddress:
        return HTTPMethod.post;
    }
  }
}
