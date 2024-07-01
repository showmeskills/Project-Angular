import 'package:flutter/material.dart';

class GoGamingFailed extends StatelessWidget {
  const GoGamingFailed({
    Key? key,
    this.onPressed,
  }) : super(key: key);

  final void Function()? onPressed;

  @override
  Widget build(BuildContext context) {
    return const Center(child: Text('Failed'));
  }
}
