import SChinese from "./SChinese";

const Japanese: typeof SChinese = {
	__translator__: "",
	ok: "OK",
	cancel: "キャンセル",
	channel_abbr: "チャネル",
	error: "エラー",
	warning: "警告",
	apply: "適用",
	settings: "設定",
	select_all: "すべて選択",
	channel: "チャネル",
	name: "名",
	note_count: "音符の数",
	language: "言語",
	general: "一般",
	app_default: "アプリのデフォルト",
	tools: "ツール",
	create_null_object_short: "ヌル",
	create_null_object: "ヌル オブジェクトを作成",
	apply_effects_short: "効果を適用",
	apply_effects: "効果を適用",
	marker_conductor: "マーカー司令官",
	easing_100_percent: "イージング百パーセント",
	unit: "単位",
	time: "時間",
	frames: "フレーム",
	seconds: "秒数",
	beat: "拍子",
	shift_seconds_and_frames: "シフト",
	mark_on: "どこ",
	add_null_layer: "ヌルレイヤーを追加",
	current_layer: "現在のレイヤー",
	ease_in: "イーズイン",
	ease_out: "イーズアウト",
	ease_in_out: "イーズインアウト",
	midi_track_selector_title: "MIDI トラックを選択",
	select_at_least_one_track: "少なくとも 1 つのトラックを選択してください。",
	no_midi_file_selected: "MIDI が選択されていない",
	select_midi_file: "MIDI",
	select_midi_track: "トラック",
	set_midi_bpm: "BPM",
	start_time: "開始時刻",
	display_start_time: "表示開始時刻",
	current_time: "現在の時刻",
	work_area: "作業エリア",
	select_a_midi_file: "MIDI シーケンスを選択する",
	midi_files: "MIDI シーケンス",
	all_files: "全ファイル",
	check_update: "アップデートを確認",
	repository_link: "リポジトリ リンク",
	about_script_engine: "スクリプトエンジンについて",
	import_om_utils: "om utils をインポート",
	import_pure_quarter_midi: "純粋な 4 分 MIDI をインポート",
	using_selected_layer_name: "MIDI トラック名の代わりに、選択したレイヤー名を使用します",
	normalize_pan_to_100: "パンを -100~100 に正規化します",
	using_layering: "@氷鳩さくのの特有なレイヤリング方法",
	optimize_apply_effects: "一部の効果の視覚モーションを有効にする",
	add_to_effect_transform: "変換という効果にプロパティを追加します",
	sure_to_import_pure_quarter_midi: "純粋な 4 分音符 MIDI ファイルをインポートしてもよろしいですか？",
	pure_quarter_midi: "純粋な 4 分音符 MIDI",
	add_at_top_of_expression: "式の先頭に追加",
	om_utils_same_as_project_directory: "AEP プロジェクトと同じディレクトリに配置する場合",
	om_utils_added_to_project: "任意の場所に配置し、AE プロジェクトに追加する場合",
	pitch: "ピッチ",
	velocity: "ベロシティ",
	duration: "持続時間",
	scale: "スケール",
	cw_rotation: "右回り",
	ccw_ratation: "左回り",
	count: "カウント",
	bool: "ブール",
	time_remap: "時間リマップ",
	pingpong: "ピンポン",
	note_on: "音符オン",
	channel_pan: "チャンネルパン",
	channel_volume: "チャンネル音量",
	channel_glide: "チャンネルポルタメント",
	horizontal_flip: "水平方向にフリップ",
	vertical_flip: "垂直方向にフリップ",
	cw_flip: "右回りにフリップ",
	ccw_flip: "左回りにフリップ",
	invert_color: "色を反転",
	tuning: "色を反転",
	base_pitch: "ベースピッチ",
	paren_stretched: "（ストレッチ）",
	paren_truncated: "（切り捨て）",
	cannot_find_window_error: "エラー：ウィンドウが見つからないか作成できません。",
	unsupported_setting_type_error: "エラー：サポートされていないセット データ型です。",
	file_unreadable_error: "エラー：ファイルを読み取れませんでした。ファイルが既に占有されているか、存在しない可能性があります。",
	midi_header_validation_error: "エラー：MIDI ファイル ヘッダー チャンクの検証に失敗しました（標準の MIDI ファイルではないか、ファイルが破損しています）。",
	midi_track_header_validation_error: "エラー：MIDI トラック ヘッダー チャンクの検証に失敗しました。",
	midi_custom_events_error: "エラー：カスタム MIDI イベントを読み取れませんでした。",
	midi_no_track_error: "エラー：MIDI ファイルに有効なトラックが含まれていません。",
	not_after_effects_error: "エラー：Adobe After Effects でこのスクリプトを使用してください。",
	cannot_create_file_error: "エラー：ファイルを作成できませんでした。",
	cannot_find_composition_error: "エラー：アクティブな構成が見つかりません。最初にコンポジションをアクティブにしてください。\n\n解決策: まずコンポジットを開き、コンポジット プレビューまたはトラック ウィンドウをクリックしてアクティブにします。",
	no_midi_error: "エラー：最初に有効な MIDI ファイルを開いてください。",
	no_options_checked_error: "エラー：少なくとも 1 つのオプションをオンにしてください。",
	no_layer_selected_error: "エラー：現在のコンポジションでレイヤーが選択されていません。",
	not_one_track_for_apply_effects_only_error: "エラー：エフェクトを適用すると、一度に選択できる MIDI トラックは 1 つだけです。",
	end_of_track_position_error: "エラー：トラックの終了位置が間違っています。期待される %1、実際には %2。",
	cannot_set_time_remap_error: "エラー：選択したレイヤーにタイム リマップを設定できません。",
	cannot_tuning_error: "エラー：選択したレイヤーにはオーディオが含まれていないため、調整できません。",
	about: "標準 MIDI ファイルを読み取り、その MIDI ファイル内のノートとコントローラーに対応するレイヤーとキーフレームを作成します。\n\nバージョン：%4\nアプリ：%2\nスペック：%3\n\n開発者：蘭音\n元開発者：David Van Brink (omino)、Dora (NGDXW)、家鼈大帝\nリポジトリ リンク：%1",
	horizontal_mirror: "水平方向のミラー",
	advanced_scale: "高度なスケール",
	loading_midi: "%1 を読み込んでいます...",
	unsupported_fps_time_division_error: "エラー：現在のモードは、FPS 時分割データフォーマットに対応していません。",
	low_version_error: "エラー：Adobe After Effects のソフトウェアのバージョンが低すぎるため、アップデートしてください。",
	invalid_mapping_velocity_values_error: "エラー：使用される違法なマッピングベロシティパラメタ。\n\n解決策：オーディオとビデオのマッピングベロシティパラメータを確認します。\n1. より小さい値は、より大きい値より大きくない；\n2. ベロシティの小さい値と大きい値は等しくはなりません。\nさもなければ、これはマッピングベロシティ操作を完了しません。",
	map_velocity: "ベロシティのマッピング",
	map_velocity_to_opacity: "ベロシティと不透明度のマッピング",
	map_velocity_to_volume: "ベロシティとオーディオレベルのマッピング",
	opacity: "不透明度",
	audio_levels: "オーディオレベル",
	notes_velocity: "音符ベロシティ",
	has_no_video_error: "エラー：選択したレイヤーにはビデオが含まれていないため、選択されたエフェクトを適用できません。",
	motion_for_horizontal_flip: "フリップのモーション",
	motion_entrance: "開始",
	motion_exit: "終了",
	motion_float_left: "フロートレフト",
	motion_float_right: "フロートライト",
	motion_float_up: "フロートアップ",
	motion_float_down: "フロートダウン",
	script_translator: "訳者：",
	invalid_duration_error: "エラー：入力された「字幕ごとの持続時間」パラメータの値は適切ではありません。",
	empty_subtitles_error: "エラー：字幕の内容を入力してください。",
	batch_subtitle_generation: "字幕の一括生成",
	linear: "リニア",
	hold_both: "ホールド両側",
	hold_in: "ホールド左側",
	hold_out: "ホールド右側",
	second_unit: "秒",
	open: "開く",
	text_document: "テキスト ファイル",
	browse: "参照",
	file_too_large_info: "ファイルが大きすぎて開きますか？",
	will_clear_existing_text_info: "既存のテキストコンテンツが消去され、変更内容が保持されない場合があります。",
};

export default Japanese;
