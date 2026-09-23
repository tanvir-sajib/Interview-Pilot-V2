import 'package:flutter/material.dart';

class InterviewSetupScreen extends StatelessWidget {
  const InterviewSetupScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Interview Setup')),
      body: const Center(child: Text('Configure interview settings')),
    );
  }
}
