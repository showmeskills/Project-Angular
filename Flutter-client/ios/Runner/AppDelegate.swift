import UIKit
import Flutter
import workmanager
// This is required for calling FlutterLocalNotificationsPlugin.setPluginRegistrantCallback method.
import flutter_local_notifications

@UIApplicationMain
@objc class AppDelegate: FlutterAppDelegate {
  override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
  ) -> Bool {
      GeneratedPluginRegistrant.register(with: self)
      // In AppDelegate.application method
      WorkmanagerPlugin.registerTask(withIdentifier: "task-identifier")
      UIApplication.shared.setMinimumBackgroundFetchInterval(TimeInterval(60*5))
      if #available(iOS 10.0, *) {
        UNUserNotificationCenter.current().delegate = self as UNUserNotificationCenterDelegate
      }
      // This is required to make any communication available in the action isolate.
      FlutterLocalNotificationsPlugin.setPluginRegistrantCallback { (registry) in
        GeneratedPluginRegistrant.register(with: registry)
      }
      // Register a periodic task in iOS 13+
//      WorkmanagerPlugin.registerPeriodicTask(withIdentifier: "be.tramckrijte.workmanagerExample.iOSBackgroundAppRefresh", frequency: NSNumber(value: 20 * 60))
    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }
}
