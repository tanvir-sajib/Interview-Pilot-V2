import 'package:flutter/material.dart';

class VoiceRecordingScreen extends StatelessWidget {
  const VoiceRecordingScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Voice Recording')),
      body: const Center(child: Text('Voice recording UI placeholder')),
    );
  }
}
