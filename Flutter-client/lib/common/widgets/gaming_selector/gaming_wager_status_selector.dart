import 'package:flutter/material.dart';
import 'package:gogaming_app/common/api/base/base_api.dart';
import 'package:gogaming_app/common/api/game_order/game_order_api.dart';
import 'package:gogaming_app/common/api/game_order/models/gaming_wager_status_model.dart';
import 'package:gogaming_app/widget_header.dart';

import 'gaming_selector.dart';

class GamingWagerStatusSelector {
  final GameType gameType;

  GamingWagerStatusSelector({required this.gameType});

  Map<String, GamingWagerStatusModel> _data = {};

  Future<GamingWagerStatusModel?> show({
    GamingWagerStatusModel? selected,
  }) {
    return GamingSelector.simple(
      title: localized('select_status'),
      itemBuilder: (context, e, index) {
        return _GamingWagerStatusSelectorItem(
          data: e,
          selected: selected,
        );
      },
      original: _data.values.toList(),
      fixedHeight: false,
    );
  }

  Stream<List<GamingWagerStatusModel>> loadDataStream() {
    return PGSpi(GameOrder.getWagerStatusSelect.toTarget(
      input: {
        'gameType': gameType.value,
      },
    )).rxRequest<List<GamingWagerStatusModel>>((value) {
      return (value['data'] as List)
          .map(
              (e) => GamingWagerStatusModel.fromJson(e as Map<String, dynamic>))
          .toList();
    }).flatMap((value) {
      return Stream.value(value.data);
    }).doOnData((event) {
      _data = {
        'all': GamingWagerStatusModel.all(),
        for (var e in event) e.code: e,
      };
    });
  }

  String getStatusText(String code) {
    return _data[code]?.description ?? '-';
  }
}

class _GamingWagerStatusSelectorItem extends StatelessWidget {
  const _GamingWagerStatusSelectorItem({
    required this.data,
    this.selected,
  });

  final GamingWagerStatusModel data;
  final GamingWagerStatusModel? selected;

  @override
  Widget build(BuildContext context) {
    return ScaleTap(
      onPressed: () {
        Get.back(result: data);
      },
      child: Container(
        padding: EdgeInsets.symmetric(horizontal: 16.dp),
        child: Container(
          height: 48.dp,
          alignment: Alignment.centerLeft,
          child: Text(
            data.description,
            style: GGTextStyle(
              fontSize: GGFontSize.content,
              color: data.code == selected?.code
                  ? GGColors.highlightButton.color
                  : GGColors.textMain.color,
            ),
          ),
        ),
      ),
    );
  }
}
