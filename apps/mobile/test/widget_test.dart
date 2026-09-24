import 'package:flutter_test/flutter_test.dart';
import 'package:flutter/material.dart';

void main() {
  testWidgets('sample widget test', (WidgetTester tester) async {
    // Build a simple widget.
    await tester.pumpWidget(const MaterialApp(home: Scaffold(body: Text('Hello'))));
    expect(find.text('Hello'), findsOneWidget);
  });
});
