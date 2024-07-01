import 'package:flutter/material.dart';

class ProxyAlert extends StatelessWidget {
  const ProxyAlert({
    super.key,
    required this.ipController,
    required this.portController,
  });

  final TextEditingController ipController;
  final TextEditingController portController;

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('请输入电脑ip和端口'),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          TextField(
            controller: ipController,
            decoration: const InputDecoration(hintText: '在此输入ip'),
          ),
          const SizedBox(height: 15),
          TextField(
            controller: portController,
            decoration: const InputDecoration(hintText: '在此输入port'),
          ),
        ],
      ),
      actions: <Widget>[
        TextButton(
          child: const Text('确定'),
          onPressed: () {
            Navigator.of(context).pop(true);
          },
        ),
        TextButton(
          child: const Text('取消'),
          onPressed: () {
            Navigator.of(context).pop(false);
          },
        ),
      ],
    );
  }
}
