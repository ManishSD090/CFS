import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:construction_erp/core/services/app_colors.dart';
import 'package:construction_erp/controllers/project/project_controller.dart';
import 'package:construction_erp/controllers/core_providers.dart';

// ─────────────────────────────────────────────────────────────────────────────
// Model metadata — display name + icon + description
// ─────────────────────────────────────────────────────────────────────────────
class _ModelInfo {
  final String key;
  final String label;
  final String description;
  final IconData icon;
  const _ModelInfo(this.key, this.label, this.description, this.icon);
}

const List<_ModelInfo> _kModels = [
  _ModelInfo('random_forest', 'Random Forest',
      'Ensemble of trees — high accuracy', Icons.forest_outlined),
  _ModelInfo('gradient_boosting', 'Gradient Boosting',
      'Sequential boosting — robust results', Icons.rocket_launch_outlined),
  _ModelInfo('linear_regression', 'Linear Regression',
      'Simple & fast baseline model', Icons.show_chart_outlined),
  _ModelInfo('svr', 'Support Vector Regression',
      'Kernel-based — handles non-linearity', Icons.scatter_plot_outlined),
  _ModelInfo('knn', 'K-Nearest Neighbours',
      'Instance-based similarity model', Icons.hub_outlined),
];

// ─────────────────────────────────────────────────────────────────────────────
// Result state model
// ─────────────────────────────────────────────────────────────────────────────
class _RiskResult {
  final double score;
  final String level;
  final String modelUsed;
  final String projectName;
  final double taskProgress;
  final double costDeviation;
  final double timeDeviation;
  final int workerCount;
  _RiskResult({
    required this.score,
    required this.level,
    required this.modelUsed,
    required this.projectName,
    required this.taskProgress,
    required this.costDeviation,
    required this.timeDeviation,
    required this.workerCount,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Screen
// ─────────────────────────────────────────────────────────────────────────────
class RiskAnalysisScreen extends ConsumerStatefulWidget {
  const RiskAnalysisScreen({super.key});

  @override
  ConsumerState<RiskAnalysisScreen> createState() => _RiskAnalysisScreenState();
}

class _RiskAnalysisScreenState extends ConsumerState<RiskAnalysisScreen>
    with SingleTickerProviderStateMixin {
  final _formKey = GlobalKey<FormState>();

  // ── Selections
  String _selectedModel = 'random_forest';
  String? _selectedProjectId;
  String? _selectedProjectName;

  // ── Controllers for sensor / site inputs
  final _temperatureCtrl      = TextEditingController(text: '35.0');
  final _humidityCtrl         = TextEditingController(text: '65.0');
  final _vibrationCtrl        = TextEditingController(text: '20.5');
  final _materialUsageCtrl    = TextEditingController(text: '500.0');
  final _machineryStatusCtrl  = TextEditingController(text: '1');
  final _workerCountCtrl      = TextEditingController(text: '30');
  final _energyCtrl           = TextEditingController(text: '250.0');
  final _safetyIncidentsCtrl  = TextEditingController(text: '0');
  final _equipUtilCtrl        = TextEditingController(text: '85.0');
  final _materialShortCtrl    = TextEditingController(text: '0');
  final _simDeviationCtrl     = TextEditingController(text: '1.2');
  final _updateFreqCtrl       = TextEditingController(text: '15');
  final _optSuggestionCtrl    = TextEditingController(text: '1');
  final _perfScoreCtrl        = TextEditingController(text: '0');

  // ── UI state
  bool _isSubmitting = false;
  _RiskResult? _result;
  late final AnimationController _resultAnim;
  late final Animation<double> _resultFade;

  @override
  void initState() {
    super.initState();
    _resultAnim = AnimationController(
        vsync: this, duration: const Duration(milliseconds: 600));
    _resultFade =
        CurvedAnimation(parent: _resultAnim, curve: Curves.easeOutCubic);
  }

  @override
  void dispose() {
    for (final c in [
      _temperatureCtrl, _humidityCtrl, _vibrationCtrl, _materialUsageCtrl,
      _machineryStatusCtrl, _workerCountCtrl, _energyCtrl,
      _safetyIncidentsCtrl, _equipUtilCtrl, _materialShortCtrl,
      _simDeviationCtrl, _updateFreqCtrl, _optSuggestionCtrl, _perfScoreCtrl,
    ]) {
      c.dispose();
    }
    _resultAnim.dispose();
    super.dispose();
  }

  // ── Submit prediction
  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    if (_selectedProjectId == null) {
      _showSnack('Please select a project first.', isError: true);
      return;
    }

    setState(() {
      _isSubmitting = true;
      _result = null;
    });
    _resultAnim.reset();

    try {
      final dio = ref.read(dioClientProvider).dio;
      final response = await dio.post('/ml/predict-risk', data: {
        'projectId':              _selectedProjectId,
        'model':                  _selectedModel,
        'temperature':            double.tryParse(_temperatureCtrl.text) ?? 35.0,
        'humidity':               double.tryParse(_humidityCtrl.text) ?? 65.0,
        'vibration_level':        double.tryParse(_vibrationCtrl.text) ?? 20.5,
        'material_usage':         double.tryParse(_materialUsageCtrl.text) ?? 500.0,
        'machinery_status':       int.tryParse(_machineryStatusCtrl.text) ?? 1,
        'worker_count':           int.tryParse(_workerCountCtrl.text) ?? 30,
        'energy_consumption':     double.tryParse(_energyCtrl.text) ?? 250.0,
        'safety_incidents':       int.tryParse(_safetyIncidentsCtrl.text) ?? 0,
        'equipment_utilization_rate': double.tryParse(_equipUtilCtrl.text) ?? 85.0,
        'material_shortage_alert': int.tryParse(_materialShortCtrl.text) ?? 0,
        'simulation_deviation':   double.tryParse(_simDeviationCtrl.text) ?? 1.2,
        'update_frequency':       int.tryParse(_updateFreqCtrl.text) ?? 15,
        'optimization_suggestion': int.tryParse(_optSuggestionCtrl.text) ?? 1,
        'performance_score':      int.tryParse(_perfScoreCtrl.text) ?? 0,
      });

      final data = response.data['data'];
      final computed = data['computed_inputs'] ?? {};

      setState(() {
        _result = _RiskResult(
          score:       (data['predicted_risk_score'] as num).toDouble(),
          level:       data['risk_level'] ?? 'LOW',
          modelUsed:   data['model_used'] ?? _selectedModel,
          projectName: data['projectName'] ?? '',
          taskProgress: ((computed['task_progress'] as num?) ?? 0).toDouble(),
          costDeviation: ((computed['cost_deviation'] as num?) ?? 0).toDouble(),
          timeDeviation: ((computed['time_deviation'] as num?) ?? 0).toDouble(),
          workerCount:  ((computed['worker_count'] as num?) ?? 0).toInt(),
        );
        _isSubmitting = false;
      });
      _resultAnim.forward();
    } catch (e) {
      setState(() => _isSubmitting = false);
      _showSnack(
        e.toString().contains('503')
            ? 'ML service is offline. Make sure the Python server is running.'
            : 'Prediction failed: ${e.toString().replaceAll('Exception: ', '')}',
        isError: true,
      );
    }
  }

  void _showSnack(String msg, {bool isError = false}) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text(msg),
      backgroundColor: isError ? AppColors.alertRed : AppColors.successGreen,
      behavior: SnackBarBehavior.floating,
    ));
  }

  // ─────────────────────────────────────────────────────────────────────────
  // BUILD
  // ─────────────────────────────────────────────────────────────────────────
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.primaryBlue,
        elevation: 0,
        automaticallyImplyLeading: false,
        title: const Padding(
          padding: EdgeInsets.only(left: 10),
          child: Text('Risk Analysis',
              style: TextStyle(
                  color: AppColors.white, fontWeight: FontWeight.w600)),
        ),
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(bottom: Radius.circular(28)),
        ),
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 20, 16, 40),
          children: [
            // ── Result card (shown after prediction)
            if (_result != null) ...[
              FadeTransition(
                opacity: _resultFade,
                child: _ResultCard(result: _result!),
              ),
              const SizedBox(height: 20),
            ],

            // ── Section 1 — Model selection
            _sectionTitle('🤖 Select ML Model'),
            const SizedBox(height: 12),
            _ModelPicker(
              selected: _selectedModel,
              onChanged: (v) => setState(() => _selectedModel = v),
            ),
            const SizedBox(height: 24),

            // ── Section 2 — Project selection
            _sectionTitle('🏗️ Select Project'),
            const SizedBox(height: 12),
            _ProjectDropdown(
              selectedId: _selectedProjectId,
              onChanged: (id, name) => setState(() {
                _selectedProjectId = id;
                _selectedProjectName = name;
              }),
            ),
            const SizedBox(height: 24),

            // ── Section 3 — Environmental inputs
            _sectionTitle('🌡️ Environmental / IoT Inputs'),
            const SizedBox(height: 12),
            _inputRow([
              _FieldDef('Temperature (°C)', _temperatureCtrl,
                  hint: '35.0', isDecimal: true),
              _FieldDef('Humidity (%)', _humidityCtrl,
                  hint: '65.0', isDecimal: true),
            ]),
            const SizedBox(height: 12),
            _FieldDef('Vibration Level', _vibrationCtrl,
                hint: '20.5', isDecimal: true).build(context),
            const SizedBox(height: 24),

            // ── Section 4 — Site activity
            _sectionTitle('⚙️ Site Activity'),
            const SizedBox(height: 12),
            _inputRow([
              _FieldDef('Material Usage (kg)', _materialUsageCtrl,
                  hint: '500.0', isDecimal: true),
              _FieldDef('Energy (kWh)', _energyCtrl,
                  hint: '250.0', isDecimal: true),
            ]),
            const SizedBox(height: 12),
            _inputRow([
              _FieldDef('Machinery Status', _machineryStatusCtrl,
                  hint: '1', isInt: true, helperText: '0=Off 1=On'),
              _FieldDef('Worker Count', _workerCountCtrl,
                  hint: '30', isInt: true),
            ]),
            const SizedBox(height: 24),

            // ── Section 5 — Safety & Equipment
            _sectionTitle('🦺 Safety & Equipment'),
            const SizedBox(height: 12),
            _inputRow([
              _FieldDef('Safety Incidents', _safetyIncidentsCtrl,
                  hint: '0', isInt: true),
              _FieldDef('Equip. Utilisation (%)', _equipUtilCtrl,
                  hint: '85.0', isDecimal: true),
            ]),
            const SizedBox(height: 12),
            _FieldDef('Material Shortage Alert', _materialShortCtrl,
                hint: '0', isInt: true, helperText: '0=No  1=Yes').build(context),
            const SizedBox(height: 24),

            // ── Section 6 — Simulation / Digital twin
            _sectionTitle('📊 Simulation Metrics'),
            const SizedBox(height: 12),
            _inputRow([
              _FieldDef('Simulation Deviation', _simDeviationCtrl,
                  hint: '1.2', isDecimal: true),
              _FieldDef('Update Frequency (min)', _updateFreqCtrl,
                  hint: '15', isInt: true),
            ]),
            const SizedBox(height: 24),

            // ── Section 7 — Categorical (label-encoded)
            _sectionTitle('🏷️ Categorical Inputs (label-encoded)'),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.primaryBlue.withOpacity(0.06),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(
                    color: AppColors.primaryBlue.withOpacity(0.2)),
              ),
              child: const Text(
                'optimization_suggestion: 0=Cost_Reduction  1=Efficiency_Boost  2=Risk_Mitigation\n'
                'performance_score: 0=Average  1=Below_Average  2=Excellent',
                style: TextStyle(fontSize: 11, color: AppColors.textGrey, height: 1.6),
              ),
            ),
            const SizedBox(height: 12),
            _inputRow([
              _FieldDef('Opt. Suggestion', _optSuggestionCtrl,
                  hint: '0–2', isInt: true),
              _FieldDef('Perf. Score', _perfScoreCtrl,
                  hint: '0–2', isInt: true),
            ]),
            const SizedBox(height: 32),

            // ── Submit button
            SizedBox(
              height: 52,
              child: ElevatedButton.icon(
                onPressed: _isSubmitting ? null : _submit,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primaryBlue,
                  disabledBackgroundColor:
                      AppColors.primaryBlue.withOpacity(0.6),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14)),
                  elevation: 0,
                ),
                icon: _isSubmitting
                    ? const SizedBox(
                        width: 18,
                        height: 18,
                        child: CircularProgressIndicator(
                            color: Colors.white, strokeWidth: 2))
                    : const Icon(Icons.analytics_outlined,
                        color: Colors.white, size: 20),
                label: Text(
                  _isSubmitting ? 'Analysing...' : 'Run Risk Analysis',
                  style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 15),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _sectionTitle(String t) => Text(t,
      style: const TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.w700,
          color: AppColors.textDark));

  Widget _inputRow(List<_FieldDef> fields) => Row(
        children: fields
            .map((f) => Expanded(
                  child: Padding(
                    padding:
                        EdgeInsets.only(right: fields.last == f ? 0 : 10),
                    child: f.build(context),
                  ),
                ))
            .toList(),
      );
}

// ─────────────────────────────────────────────────────────────────────────────
// Model picker chips
// ─────────────────────────────────────────────────────────────────────────────
class _ModelPicker extends StatelessWidget {
  final String selected;
  final ValueChanged<String> onChanged;
  const _ModelPicker({required this.selected, required this.onChanged});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: _kModels
          .map((m) => _ModelTile(
              info: m,
              isSelected: selected == m.key,
              onTap: () => onChanged(m.key)))
          .toList(),
    );
  }
}

class _ModelTile extends StatelessWidget {
  final _ModelInfo info;
  final bool isSelected;
  final VoidCallback onTap;
  const _ModelTile(
      {required this.info, required this.isSelected, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        decoration: BoxDecoration(
          color: isSelected
              ? AppColors.primaryBlue
              : AppColors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: isSelected
                ? AppColors.primaryBlue
                : AppColors.lightGrey,
            width: isSelected ? 2 : 1,
          ),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: AppColors.primaryBlue.withOpacity(0.25),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  )
                ]
              : [],
        ),
        child: Row(
          children: [
            Icon(info.icon,
                color: isSelected ? Colors.white : AppColors.primaryBlue,
                size: 22),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(info.label,
                      style: TextStyle(
                          fontWeight: FontWeight.w700,
                          fontSize: 13,
                          color: isSelected
                              ? Colors.white
                              : AppColors.textDark)),
                  const SizedBox(height: 2),
                  Text(info.description,
                      style: TextStyle(
                          fontSize: 11,
                          color: isSelected
                              ? Colors.white70
                              : AppColors.textGrey)),
                ],
              ),
            ),
            if (isSelected)
              const Icon(Icons.check_circle, color: Colors.white, size: 20),
          ],
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Project dropdown (fetches from existing project controller)
// ─────────────────────────────────────────────────────────────────────────────
class _ProjectDropdown extends ConsumerWidget {
  final String? selectedId;
  final void Function(String id, String name) onChanged;
  const _ProjectDropdown(
      {required this.selectedId, required this.onChanged});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final projectState = ref.watch(projectControllerProvider);

    return projectState.when(
      loading: () => Container(
        height: 52,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.lightGrey),
        ),
        child: const Center(
            child: SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(strokeWidth: 2))),
      ),
      error: (_, __) => Container(
        height: 52,
        padding: const EdgeInsets.symmetric(horizontal: 14),
        decoration: BoxDecoration(
          color: AppColors.alertRedLight,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.alertRed.withOpacity(0.4)),
        ),
        child: const Center(
            child: Text('Failed to load projects',
                style: TextStyle(color: AppColors.alertRed, fontSize: 13))),
      ),
      data: (state) {
        final projects = state.projects;
        if (projects.isEmpty) {
          return Container(
            height: 52,
            padding: const EdgeInsets.symmetric(horizontal: 14),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.lightGrey),
            ),
            child: const Center(
                child: Text('No projects found',
                    style: TextStyle(
                        color: AppColors.textGrey, fontSize: 13))),
          );
        }

        // If the currently selected id is no longer in the list, reset
        final validId = projects.any((p) => p.id == selectedId)
            ? selectedId
            : null;

        return Container(
          padding: const EdgeInsets.symmetric(horizontal: 14),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
                color: validId != null
                    ? AppColors.primaryBlue.withOpacity(0.5)
                    : AppColors.lightGrey),
          ),
          child: DropdownButtonHideUnderline(
            child: DropdownButton<String>(
              value: validId,
              isExpanded: true,
              hint: const Text('Select Project',
                  style: TextStyle(
                      color: AppColors.textGrey, fontSize: 14)),
              items: projects
                  .map((p) => DropdownMenuItem(
                        value: p.id,
                        child: Text(
                          '${p.name}  (${p.projectId})',
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(fontSize: 13),
                        ),
                      ))
                  .toList(),
              onChanged: (id) {
                if (id == null) return;
                final proj = projects.firstWhere((p) => p.id == id);
                onChanged(id, proj.name);
              },
            ),
          ),
        );
      },
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Input field definition helper
// ─────────────────────────────────────────────────────────────────────────────
class _FieldDef {
  final String label;
  final TextEditingController ctrl;
  final String hint;
  final bool isDecimal;
  final bool isInt;
  final String? helperText;

  const _FieldDef(this.label, this.ctrl,
      {required this.hint,
      this.isDecimal = false,
      this.isInt = false,
      this.helperText});

  Widget build(BuildContext context) {
    return TextFormField(
      controller: ctrl,
      keyboardType: isDecimal
          ? const TextInputType.numberWithOptions(decimal: true)
          : isInt
              ? TextInputType.number
              : TextInputType.text,
      inputFormatters: isInt
          ? [FilteringTextInputFormatter.digitsOnly]
          : isDecimal
              ? [FilteringTextInputFormatter.allow(RegExp(r'[\d.]'))]
              : null,
      style: const TextStyle(fontSize: 13),
      decoration: InputDecoration(
        labelText: label,
        labelStyle:
            const TextStyle(color: AppColors.textGrey, fontSize: 12),
        hintText: hint,
        helperText: helperText,
        helperStyle:
            const TextStyle(fontSize: 10, color: AppColors.textGrey),
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: BorderSide(color: Colors.grey.shade300),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: AppColors.primaryBlue),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: AppColors.alertRed),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: AppColors.alertRed),
        ),
        filled: true,
        fillColor: Colors.white,
      ),
      validator: (v) {
        if (v == null || v.trim().isEmpty) return 'Required';
        if (isDecimal && double.tryParse(v) == null) return 'Invalid number';
        if (isInt && int.tryParse(v) == null) return 'Must be integer';
        return null;
      },
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Result card
// ─────────────────────────────────────────────────────────────────────────────
class _ResultCard extends StatelessWidget {
  final _RiskResult result;
  const _ResultCard({required this.result});

  @override
  Widget build(BuildContext context) {
    final Color riskColor;
    final Color riskBg;
    final IconData riskIcon;

    switch (result.level.toUpperCase()) {
      case 'HIGH':
        riskColor = AppColors.alertRed;
        riskBg    = AppColors.alertRedLight;
        riskIcon  = Icons.warning_rounded;
        break;
      case 'MEDIUM':
        riskColor = AppColors.statusYellowDark;
        riskBg    = const Color(0xFFFFF8E1);
        riskIcon  = Icons.info_outline_rounded;
        break;
      default:
        riskColor = AppColors.successGreen;
        riskBg    = AppColors.successGreenLight;
        riskIcon  = Icons.check_circle_outline_rounded;
    }

    // Human-readable model label
    final modelLabel = _kModels
        .firstWhere((m) => m.key == result.modelUsed,
            orElse: () => _kModels.first)
        .label;

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        boxShadow: [
          BoxShadow(
            color: riskColor.withOpacity(0.15),
            blurRadius: 20,
            offset: const Offset(0, 6),
          ),
        ],
        border: Border.all(color: riskColor.withOpacity(0.3), width: 1.5),
      ),
      child: Column(
        children: [
          // ── Risk header
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: riskBg,
              borderRadius: const BorderRadius.vertical(top: Radius.circular(18)),
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration:
                      BoxDecoration(color: riskColor, shape: BoxShape.circle),
                  child: Icon(riskIcon, color: Colors.white, size: 24),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(result.projectName,
                          style: const TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 15,
                              color: AppColors.textDark),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis),
                      const SizedBox(height: 4),
                      Row(children: [
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                              color: riskColor,
                              borderRadius: BorderRadius.circular(6)),
                          child: Text(result.level,
                              style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold)),
                        ),
                        const SizedBox(width: 8),
                        Text('via $modelLabel',
                            style: const TextStyle(
                                fontSize: 11, color: AppColors.textGrey)),
                      ]),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // ── Score gauge
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 20),
            child: Column(children: [
              Text(
                result.score.toStringAsFixed(1),
                style: TextStyle(
                    fontSize: 56,
                    fontWeight: FontWeight.w900,
                    color: riskColor,
                    height: 1),
              ),
              const Text('Risk Score  (0 – 100)',
                  style: TextStyle(
                      fontSize: 12, color: AppColors.textGrey)),
              const SizedBox(height: 16),
              // Progress bar
              ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: LinearProgressIndicator(
                  value: (result.score / 100).clamp(0.0, 1.0),
                  minHeight: 10,
                  backgroundColor: riskColor.withOpacity(0.15),
                  valueColor: AlwaysStoppedAnimation<Color>(riskColor),
                ),
              ),
            ]),
          ),

          // ── Computed inputs from DB
          const Divider(height: 1),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(children: [
              const Text('Live Data Used for Prediction',
                  style: TextStyle(
                      fontWeight: FontWeight.w600,
                      fontSize: 12,
                      color: AppColors.textGrey)),
              const SizedBox(height: 12),
              Row(children: [
                _StatChip('Task Progress',
                    '${(result.taskProgress * 100).toStringAsFixed(1)}%',
                    Icons.task_alt_outlined),
                const SizedBox(width: 8),
                _StatChip('Workers',
                    '${result.workerCount}',
                    Icons.people_outline),
              ]),
              const SizedBox(height: 8),
              Row(children: [
                _StatChip('Cost Dev.',
                    '₹${result.costDeviation.toStringAsFixed(0)}',
                    Icons.currency_rupee_outlined),
                const SizedBox(width: 8),
                _StatChip('Time Dev.',
                    '${result.timeDeviation.toStringAsFixed(1)} d',
                    Icons.schedule_outlined),
              ]),
            ]),
          ),
        ],
      ),
    );
  }
}

class _StatChip extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  const _StatChip(this.label, this.value, this.icon);

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: AppColors.background,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: AppColors.lightGrey),
        ),
        child: Row(children: [
          Icon(icon, size: 16, color: AppColors.primaryBlue),
          const SizedBox(width: 6),
          Expanded(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(label,
                  style: const TextStyle(
                      fontSize: 10, color: AppColors.textGrey),
                  overflow: TextOverflow.ellipsis),
              Text(value,
                  style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.bold,
                      color: AppColors.textDark)),
            ]),
          ),
        ]),
      ),
    );
  }
}
