import 'package:flutter/material.dart';

class TextAnswerScreen extends StatelessWidget {
  const TextAnswerScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Text Answer')),
      body: const Center(child: Text('Text answer input placeholder')),
    );
  }
}
