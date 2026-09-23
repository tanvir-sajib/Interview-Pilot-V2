import 'package:flutter/material.dart';
import 'screens/splash.dart';
import 'screens/onboarding.dart';
import 'screens/auth.dart';
import 'screens/home.dart';
import 'screens/interview_setup.dart';
import 'screens/interview.dart';
import 'screens/text_answer.dart';
import 'screens/voice_recording.dart';
import 'screens/feedback.dart';
import 'screens/session_summary.dart';
import 'screens/history.dart';
import 'screens/profile.dart';

void main() => runApp(const InterviewCoachApp());

class InterviewCoachApp extends StatelessWidget {
  const InterviewCoachApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Interview Coach',
      theme: ThemeData(primarySwatch: Colors.blue),
      initialRoute: '/',
      routes: {
        '/': (context) => const SplashScreen(),
        '/onboarding': (context) => const OnboardingScreen(),
        '/auth': (context) => const AuthScreen(),
        '/home': (context) => const HomeScreen(),
        '/interview-setup': (context) => const InterviewSetupScreen(),
        '/interview': (context) => const InterviewScreen(),
        '/text-answer': (context) => const TextAnswerScreen(),
        '/voice-recording': (context) => const VoiceRecordingScreen(),
        '/feedback': (context) => const FeedbackScreen(),
        '/session-summary': (context) => const SessionSummaryScreen(),
        '/history': (context) => const HistoryScreen(),
        '/profile': (context) => const ProfileScreen(),
      },
    );
  }
}
