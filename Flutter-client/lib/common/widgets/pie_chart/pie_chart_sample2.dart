import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:gogaming_app/widget_header.dart';
import 'indicator.dart';

class PieChartSample2 extends StatefulWidget {
  const PieChartSample2({
    super.key,
    required this.chartData,
    this.onTouchedIndex,
  });

  final List<PieChartSectionData> chartData;
  final void Function(int index)? onTouchedIndex;

  @override
  State<StatefulWidget> createState() => PieChart2State();
}

class PieChart2State extends State<PieChartSample2> {
  int touchedIndex = -1;

  void setTouchEdIndex(int value) {
    if (touchedIndex != value) {
      touchedIndex = value;
      widget.onTouchedIndex?.call(value);
    }
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTap: () {
        setTouchEdIndex(-1);
      },
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          SizedBox(
            width: 128.dp,
            child: AspectRatio(
              aspectRatio: 1,
              child: PieChart(
                PieChartData(
                  pieTouchData: PieTouchData(
                      touchCallback: (FlTouchEvent event, pieTouchResponse) {
                    if (mounted) {
                      setState(() {
                        if (!event.isInterestedForInteractions ||
                            pieTouchResponse == null ||
                            pieTouchResponse.touchedSection == null) {
                          return;
                        }
                        if (pieTouchResponse
                                .touchedSection?.touchedSectionIndex !=
                            null) {
                          setTouchEdIndex(pieTouchResponse
                              .touchedSection!.touchedSectionIndex);
                        }
                      });
                    }
                  }),
                  borderData: FlBorderData(
                    show: false,
                  ),
                  sectionsSpace: 1.dp,
                  startDegreeOffset: -90,
                  centerSpaceRadius: 48.dp,
                  sections: widget.chartData,
                ),
              ),
            ),
          ),
          const Spacer(),
          Container(
            margin: EdgeInsets.only(top: 6.dp),
            width: 140.dp,
            child: Column(
              mainAxisSize: MainAxisSize.max,
              mainAxisAlignment: MainAxisAlignment.start,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: List.generate(widget.chartData.length, (index) {
                final e = widget.chartData[index];
                if (e.title.isEmpty) {
                  return const SizedBox(height: 0);
                }
                return Padding(
                  padding: EdgeInsets.only(top: index == 0 ? 0 : 5.dp),
                  child: GestureDetector(
                    behavior: HitTestBehavior.opaque,
                    onTap: () {
                      setTouchEdIndex(index);
                    },
                    child: Indicator(
                      color: e.color,
                      text: e.title,
                      isSquare: true,
                      size: 8.dp,
                      style: e.titleStyle,
                    ),
                  ),
                );
              }).toList(),
            ),
          ),
        ],
      ),
    );
  }
}
