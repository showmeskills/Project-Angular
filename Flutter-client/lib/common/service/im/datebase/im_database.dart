import 'package:drift/drift.dart';
import 'package:drift/native.dart';
import 'package:path_provider/path_provider.dart';
import 'package:sqlite3_flutter_libs/sqlite3_flutter_libs.dart';
import 'dart:io';
import '../../account_service.dart';
import 'im_tables.dart';
import 'package:sqlite3/sqlite3.dart';
import 'package:path/path.dart' as p;
import '../models/chat_content_model.dart';
part 'im_database.g.dart';

@DriftDatabase(tables: [ChatContentItems])
class AppDatabase extends _$AppDatabase {
  AppDatabase() : super(_openConnection());

  @override
  int get schemaVersion => 3;

  @override
  MigrationStrategy get migration {
    return MigrationStrategy(
      onCreate: (Migrator m) async {
        await m.createAll();
      },
      onUpgrade: (Migrator m, int from, int to) async {
        if (from < 2) {
          await m.addColumn(chatContentItems, chatContentItems.assets);
        }
        if (from < 3) {
          await m.addColumn(chatContentItems, chatContentItems.uploadRisk);
        }
      },
    );
  }
}

LazyDatabase _openConnection() {
  // the LazyDatabase util lets us find the right location for the file async.
  return LazyDatabase(() async {
    // put the database file, called db.sqlite here, into the documents folder
    // for your app.
    final dbFolder = await getApplicationDocumentsDirectory();
    final dbName = '${AccountService().curGamingUser?.uid ?? ''}_im_db.sqlite';
    final file = File(p.join(dbFolder.path, dbName));
    print('AppDatabase ------- sqlite path -------');
    print(file);
    print('AppDatabase ------- sqlite path -------');
    // Also work around limitations on old Android versions
    if (Platform.isAndroid) {
      await applyWorkaroundToOpenSqlite3OnOldAndroidVersions();
    }

    // Make sqlite3 pick a more suitable location for temporary files - the
    // one from the system may be inaccessible due to sandboxing.
    final cachebase = (await getTemporaryDirectory()).path;
    // We can't access /tmp on Android, which sqlite3 would try by default.
    // Explicitly tell it about the correct temporary directory.
    sqlite3.tempDirectory = cachebase;

    return NativeDatabase.createInBackground(file);
  });
}
