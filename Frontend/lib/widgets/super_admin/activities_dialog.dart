import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:construction_erp/core/services/app_colors.dart';
import 'package:construction_erp/controllers/super_admin/super_admin_controller.dart';

class ActivitiesDialog extends ConsumerStatefulWidget {
  const ActivitiesDialog({super.key});

  @override
  ConsumerState<ActivitiesDialog> createState() => _ActivitiesDialogState();
}

class _ActivitiesDialogState extends ConsumerState<ActivitiesDialog> {
  int _currentPage = 1;
  final int _limit = 10;
  Future<Map<String, dynamic>>? _activitiesFuture;

  @override
  void initState() {
    super.initState();
    _fetchPage(_currentPage);
  }

  void _fetchPage(int page) {
    setState(() {
      _currentPage = page;
      _activitiesFuture = ref
          .read(superAdminControllerProvider.notifier)
          .getPaginatedRecentActivities(page: _currentPage, limit: _limit);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Container(
        width: 600, // Make it somewhat wide on larger screens
        height: 600, // Give it a fixed height or max height for scrolling
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  "All System Activities",
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: () => Navigator.of(context).pop(),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Expanded(
              child: FutureBuilder<Map<String, dynamic>>(
                future: _activitiesFuture,
                builder: (context, snapshot) {
                  if (snapshot.connectionState == ConnectionState.waiting) {
                    return const Center(child: CircularProgressIndicator());
                  } else if (snapshot.hasError) {
                    return Center(child: Text("Error: ${snapshot.error}"));
                  } else if (!snapshot.hasData || snapshot.data!['data'].isEmpty) {
                    return const Center(child: Text("No activities found."));
                  }

                  final data = snapshot.data!['data'] as List<dynamic>;
                  final pagination = snapshot.data!['pagination'];
                  final int totalPages = pagination['totalPages'] ?? 1;

                  return Column(
                    children: [
                      Expanded(
                        child: ListView.separated(
                          itemCount: data.length,
                          separatorBuilder: (context, index) => const Divider(height: 24),
                          itemBuilder: (context, index) {
                            final activity = data[index];
                            return _buildActivityItem(activity);
                          },
                        ),
                      ),
                      const SizedBox(height: 16),
                      _buildPaginationControls(totalPages),
                    ],
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildActivityItem(dynamic activity) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(
          _getIconForType(activity['type']),
          color: _getColorForType(activity['type']),
          size: 24,
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                activity['title'] ?? 'Activity',
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
              ),
              const SizedBox(height: 4),
              Text(
                activity['description'] ?? '',
                style: TextStyle(color: Colors.grey.shade700, fontSize: 13),
              ),
              const SizedBox(height: 4),
              Text(
                activity['timeText'] ?? '',
                style: const TextStyle(color: Colors.grey, fontSize: 11),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildPaginationControls(int totalPages) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        IconButton(
          icon: const Icon(Icons.chevron_left),
          onPressed: _currentPage > 1 ? () => _fetchPage(_currentPage - 1) : null,
        ),
        Text("Page $_currentPage of $totalPages"),
        IconButton(
          icon: const Icon(Icons.chevron_right),
          onPressed: _currentPage < totalPages ? () => _fetchPage(_currentPage + 1) : null,
        ),
      ],
    );
  }

  IconData _getIconForType(String? type) {
    switch (type) {
      case 'company_created':
        return Icons.business;
      case 'company_suspended':
        return Icons.block;
      case 'inactive_warning':
        return Icons.warning_amber_rounded;
      case 'company_edited':
        return Icons.edit;
      case 'admin_updated':
        return Icons.admin_panel_settings;
      default:
        return Icons.info_outline;
    }
  }

  Color _getColorForType(String? type) {
    switch (type) {
      case 'company_created':
        return AppColors.primaryBlue;
      case 'company_suspended':
        return AppColors.alertRed;
      case 'inactive_warning':
        return Colors.orange;
      case 'company_edited':
        return Colors.teal;
      case 'admin_updated':
        return Colors.purple;
      default:
        return Colors.grey;
    }
  }
}
