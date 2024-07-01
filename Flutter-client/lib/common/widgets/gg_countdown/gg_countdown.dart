import 'package:flutter/material.dart';
import 'package:flutter_countdown_timer/current_remaining_time.dart';
import 'package:flutter_countdown_timer/flutter_countdown_timer.dart';
import 'package:gogaming_app/widget_header.dart';

class GGCountdown extends StatefulWidget {
  const GGCountdown({
    super.key,
    required this.duration,
    this.stepDuration = const Duration(milliseconds: 1000),
    this.onEnd,
    required this.widgetBuilder,
  });

  final Duration duration;

  ///Used to customize the countdown style widget
  final CountdownTimerWidgetBuilder widgetBuilder;
  final Duration stepDuration;

  ///Event called after the countdown ends
  final VoidCallback? onEnd;

  @override
  State<GGCountdown> createState() => _GGCountdownState();
}

class _GGCountdownState extends State<GGCountdown> {
  late int value;

  @override
  void initState() {
    super.initState();
    value = widget.duration.inMilliseconds;
  }

  @override
  void didUpdateWidget(GGCountdown oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.stepDuration != widget.stepDuration ||
        oldWidget.duration != widget.duration) {
      value = widget.duration.inMilliseconds;
    }
  }

  @override
  Widget build(BuildContext context) {
    return TimerWidget(
      builder: (context) {
        if (value >= widget.stepDuration.inMilliseconds) {
          return widget.widgetBuilder
              .call(context, currentRemainingTime(value));
        }
        return widget.widgetBuilder.call(
          context,
          CurrentRemainingTime(days: 0, hours: 0, min: 0, sec: 0),
        );
      },
      stop: widget.duration,
      period: widget.stepDuration,
      onTick: () {
        value -= widget.stepDuration.inMilliseconds;
        if (value < widget.stepDuration.inMilliseconds) {
          widget.onEnd?.call();
        }
      },
    );
  }

  CurrentRemainingTime currentRemainingTime(int value) {
    int? days, hours, min, sec;
    int timestamp = (value / 1000).floor();
    if (value >= 86400) {
      days = (timestamp / 86400).floor();
      timestamp -= days * 86400;
    }
    if (timestamp >= 3600) {
      hours = (timestamp / 3600).floor();
      timestamp -= hours * 3600;
    } else if (days != null) {
      hours = 0;
    }
    if (timestamp >= 60) {
      min = (timestamp / 60).floor();
      timestamp -= min * 60;
    } else if (hours != null) {
      min = 0;
    }
    sec = timestamp.toInt();
    return CurrentRemainingTime(days: days, hours: hours, min: min, sec: sec);
  }
}
