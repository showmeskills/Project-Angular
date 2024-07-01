import 'package:flutter/material.dart';

class WebErrorPage extends StatelessWidget {
  const WebErrorPage({
    Key? key,
    required this.onReload,
  }) : super(key: key);
  final void Function() onReload;

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.white,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          _buildTitle(),
          const SizedBox(height: 30),
          _buildLink(),
          const SizedBox(height: 30),
          _buildReload(),
        ],
      ),
    );
  }

  Widget _buildReload() {
    return InkWell(
      onTap: onReload,
      child: Container(
        width: 80,
        height: 45,
        decoration: BoxDecoration(
          color: Colors.blueAccent,
          borderRadius: BorderRadius.circular(8),
        ),
        alignment: AlignmentDirectional.center,
        child: const Text(
          'Reload',
          style: TextStyle(fontSize: 18, color: Colors.white),
        ),
      ),
    );
  }

  Widget _buildLink() {
    return const Row(
      children: [
        Expanded(
          child: Text(
            "terminated the connection unexpectedly.",
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 18,
              color: Colors.black54,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildTitle() {
    return const Row(
      children: [
        Expanded(
          child: Text(
            "Can't access the websit",
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 22,
              color: Colors.black,
            ),
          ),
        ),
      ],
    );
  }
}
