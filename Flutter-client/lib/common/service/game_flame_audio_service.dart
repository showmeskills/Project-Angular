import 'package:flame_audio/flame_audio.dart';

import '../api/base/base_api.dart';

class GameFlameAudioService {
  factory GameFlameAudioService() => _getInstance();

  static GameFlameAudioService get sharedInstance => _getInstance();

  static GameFlameAudioService? _instance;

  static GameFlameAudioService _getInstance() {
    _instance ??= GameFlameAudioService._internal();
    return _instance!;
  }

  GameFlameAudioService._internal();

  final RxBool isPlaying = false.obs;

  void startBgmMusic(String path, bool isLooping,{double volume = 1}) {
    // FlameAudio.bgm.dispose();
    FlameAudio.bgm.initialize();
    if (isLooping) {
      FlameAudio.bgm.play(path, volume: volume);
    } else {
      FlameAudio.play(path, volume: volume);
    }
  }

  void resume() {
    isPlaying.value = true;
    FlameAudio.bgm.resume();
  }

  // 回到前台
  void resumeOnly() {
    if (isPlaying.value) {
      FlameAudio.bgm.resume();
    }
  }

  void pause() {
    isPlaying.value = false;
    pauseOnly();
  }

  // 界面不可见需要暂停。但是不改变单例的播放状态
  void pauseOnly() {
    FlameAudio.bgm.pause();
  }

  void stop() {
    FlameAudio.bgm.stop();
  }
}
