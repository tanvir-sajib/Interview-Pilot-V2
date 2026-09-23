import 'package:flutter/material.dart';

class SessionSummaryScreen extends StatelessWidget {
  const SessionSummaryScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Session Summary')),
      body: const Center(child: Text('Session summary UI placeholder')),
    );
  }
}
