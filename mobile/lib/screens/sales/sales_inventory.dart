import 'package:flutter/material.dart';

import '../../core/format.dart';
import '../../core/theme.dart';
import '../../models/sales.dart';
import '../../state/app_scope.dart';
import '../../widgets/async_loader.dart';
import '../../widgets/common.dart';

class InventoryTab extends StatefulWidget {
  const InventoryTab({super.key});

  @override
  State<InventoryTab> createState() => _InventoryTabState();
}

class _InventoryTabState extends State<InventoryTab> {
  int _reloadKey = 0;

  Future<InventoryPayload> _load() => AppScope.of(context).api.inventory();

  @override
  Widget build(BuildContext context) {
    return AsyncLoader<InventoryPayload>(
      key: ValueKey(_reloadKey),
      load: _load,
      onError: 'Inventory unavailable',
      builder: (context, inv) => RefreshIndicator(
        onRefresh: () async => setState(() => _reloadKey++),
        child: ListView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(16),
          children: [
            for (final project in inv.projects)
              Padding(
                padding: const EdgeInsets.only(bottom: 16),
                child: _ProjectSection(
                  project: project,
                  statusMeta: inv.unitStatusMeta,
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class _ProjectSection extends StatefulWidget {
  const _ProjectSection({required this.project, required this.statusMeta});
  final Project project;
  final Map<String, StatusMeta> statusMeta;

  @override
  State<_ProjectSection> createState() => _ProjectSectionState();
}

class _ProjectSectionState extends State<_ProjectSection> {
  int _towerIndex = 0;

  @override
  Widget build(BuildContext context) {
    final p = widget.project;
    final towers = p.towers;
    final tower = towers.isEmpty ? null : towers[_towerIndex.clamp(0, towers.length - 1)];
    return SectionCard(
      title: p.name,
      trailing: Text(
        p.location,
        style: const TextStyle(fontSize: 11, color: AppColors.textSubtle),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'RERA ${p.reraNo}',
            style: const TextStyle(fontSize: 11, color: AppColors.textSubtle),
          ),
          const SizedBox(height: 12),
          if (towers.length > 1) ...[
            SizedBox(
              height: 36,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                itemCount: towers.length,
                separatorBuilder: (_, _) => const SizedBox(width: 8),
                itemBuilder: (context, i) => ChoiceChip(
                  label: Text(towers[i].name),
                  selected: _towerIndex == i,
                  onSelected: (_) => setState(() => _towerIndex = i),
                ),
              ),
            ),
            const SizedBox(height: 12),
          ],
          if (tower == null)
            const EmptyState(icon: Icons.apartment_outlined, title: 'No towers in this project')
          else
            _UnitGrid(tower: tower, statusMeta: widget.statusMeta),
        ],
      ),
    );
  }
}

class _UnitGrid extends StatelessWidget {
  const _UnitGrid({required this.tower, required this.statusMeta});
  final Tower tower;
  final Map<String, StatusMeta> statusMeta;

  @override
  Widget build(BuildContext context) {
    // Group by floor, descending.
    final floors = <int, List<Unit>>{};
    for (final u in tower.units) {
      floors.putIfAbsent(u.floor, () => []).add(u);
    }
    final sortedFloors = floors.keys.toList()..sort((a, b) => b.compareTo(a));
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        for (final floor in sortedFloors)
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 4),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Floor $floor',
                  style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.textSubtle),
                ),
                const SizedBox(height: 6),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    for (final unit in floors[floor]!)
                      _UnitCell(
                        unit: unit,
                        color: _unitColor(unit.status, statusMeta),
                        onTap: () => Navigator.of(context).push(
                          MaterialPageRoute(builder: (_) => UnitDetailScreen(unit: unit, meta: statusMeta)),
                        ),
                      ),
                  ],
                ),
              ],
            ),
          ),
        const SizedBox(height: 10),
        _Legend(statusMeta: statusMeta),
        const SizedBox(height: 2),
      ],
    );
  }

  Color _unitColor(String status, Map<String, StatusMeta> meta) {
    final m = meta[status];
    return m == null ? AppColors.textSubtle : colorFromHex(m.dot);
  }
}

class _Legend extends StatelessWidget {
  const _Legend({this.statusMeta});
  final Map<String, StatusMeta>? statusMeta;

  @override
  Widget build(BuildContext context) {
    const fallback = {
      'available': Color(0xFF22C55E),
      'blocked': Color(0xFFEAB308),
      'token_paid': Color(0xFF3B82F6),
      'sold': Color(0xFFEF4444),
      'under_maintenance': Color(0xFF6B7280),
    };
    final meta = statusMeta;
    final entries = meta == null
        ? fallback.entries.toList()
        : meta.entries
            .map((e) => MapEntry(e.key, colorFromHex(e.value.dot)))
            .toList();
    return Wrap(
      spacing: 12,
      runSpacing: 6,
      children: [
        for (final e in entries)
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 8,
                height: 8,
                decoration: BoxDecoration(color: e.value, shape: BoxShape.circle),
              ),
              const SizedBox(width: 4),
              Text(
                meta?[e.key]?.label ?? e.key.replaceAll('_', ' '),
                style: const TextStyle(fontSize: 10, color: AppColors.textMuted),
              ),
            ],
          ),
      ],
    );
  }
}

class _UnitCell extends StatelessWidget {
  const _UnitCell({required this.unit, required this.color, required this.onTap});
  final Unit unit;
  final Color color;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: color,
      borderRadius: BorderRadius.circular(8),
      child: InkWell(
        borderRadius: BorderRadius.circular(8),
        onTap: onTap,
        child: Container(
          width: 64,
          padding: const EdgeInsets.symmetric(vertical: 8),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(8),
          ),
          child: Column(
            children: [
              Text(
                unit.no.split('-').last,
                style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: Colors.white),
              ),
              const SizedBox(height: 2),
              Text(
                '${unit.sqft}',
                style: TextStyle(fontSize: 9, color: Colors.white.withValues(alpha: 0.85)),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class UnitDetailScreen extends StatefulWidget {
  const UnitDetailScreen({super.key, required this.unit, required this.meta});
  final Unit unit;
  final Map<String, StatusMeta> meta;

  @override
  State<UnitDetailScreen> createState() => _UnitDetailScreenState();
}

class _UnitDetailScreenState extends State<UnitDetailScreen> {
  bool _busy = false;
  String? _holdInfo;

  Unit get unit => widget.unit;

  Future<void> _hold() async {
    setState(() {
      _busy = true;
      _holdInfo = null;
    });
    try {
      final result = await AppScope.of(context).api.inventoryLock(unit.id);
      final expiresAt = result['expiresAt'] as num? ?? 0;
      if (mounted) {
        setState(() {
          _holdInfo = 'Unit locked for 15 min until ${Fmt.dateTime(DateTime.fromMillisecondsSinceEpoch(expiresAt.toInt()).toIso8601String())}.';
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
      }
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _quote() async {
    setState(() {
      _busy = true;
      _holdInfo = null;
    });
    try {
      await AppScope.of(context).api.inventoryLock(unit.id);
      if (!mounted) return;
      setState(() => _busy = false);
      final created = await Navigator.of(context).push<bool>(
        MaterialPageRoute(builder: (_) => _BookingSheet(unit: unit)),
      );
      if (created == true && mounted) {
        Navigator.of(context).pop(true);
      }
    } catch (e) {
      if (mounted) {
        setState(() => _busy = false);
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final statusMeta = widget.meta[unit.status];
    final statusColor = statusMeta == null ? AppColors.textSubtle : colorFromHex(statusMeta.dot);
    return Scaffold(
      appBar: AppBar(title: Text(unit.no)),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: AppColors.sidebar,
              borderRadius: BorderRadius.circular(14),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(
                      unit.no,
                      style: const TextStyle(
                        fontFamily: 'monospace',
                        fontSize: 18,
                        fontWeight: FontWeight.w700,
                        color: Colors.white,
                      ),
                    ),
                    const Spacer(),
                    StatusPill(label: statusMeta?.label ?? unit.status, color: statusColor, dark: true),
                  ],
                ),
                const SizedBox(height: 14),
                Row(
                  children: [
                    _Fact(label: 'Type', value: unit.type),
                    _Fact(label: 'Tower', value: unit.tower),
                    _Fact(label: 'Floor', value: '${unit.floor}'),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          SectionCard(
            title: 'Pricing',
            child: Column(
              children: [
                RowLabel(label: 'Carpet area', value: '${unit.sqft} sq ft'),
                RowLabel(label: 'Base price', value: Fmt.money(unit.price)),
                RowLabel(label: 'Rate', value: '${Fmt.moneyCompact(unit.price / unit.sqft)}/sq ft'),
              ],
            ),
          ),
          if (_holdInfo != null) ...[
            const SizedBox(height: 14),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.infoSoft,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Row(
                children: [
                  const Icon(Icons.lock_clock_outlined, size: 16, color: AppColors.info),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      _holdInfo!,
                      style: const TextStyle(fontSize: 12, color: AppColors.info),
                    ),
                  ),
                ],
              ),
            ),
          ],
          const SizedBox(height: 20),
          FilledButton.icon(
            onPressed: _busy ? null : _quote,
            icon: const Icon(Icons.request_quote_outlined, size: 18),
            label: const Text('Generate quote'),
          ),
          const SizedBox(height: 10),
          OutlinedButton.icon(
            onPressed: _busy ? null : _hold,
            icon: const Icon(Icons.lock_outline, size: 18),
            label: const Text('Lock unit (15 min hold)'),
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }
}

class _Fact extends StatelessWidget {
  const _Fact({required this.label, required this.value});
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label.toUpperCase(),
            style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: Colors.white.withValues(alpha: 0.55)),
          ),
          const SizedBox(height: 3),
          Text(
            value,
            style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Colors.white),
          ),
        ],
      ),
    );
  }
}

class _BookingSheet extends StatefulWidget {
  const _BookingSheet({required this.unit});
  final Unit unit;

  @override
  State<_BookingSheet> createState() => _BookingSheetState();
}

class _BookingSheetState extends State<_BookingSheet> {
  final _formKey = GlobalKey<FormState>();
  final _customer = TextEditingController();
  double _discount = 0;
  bool _busy = false;

  @override
  void dispose() {
    _customer.dispose();
    super.dispose();
  }

  Future<void> _create() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _busy = true);
    try {
      final result = await AppScope.of(context).api.quoteCreate(
            customer: _customer.text.trim(),
            unitId: widget.unit.id,
            discountPct: _discount,
          );
      if (mounted) {
        Navigator.of(context).pop(true);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              result.needsApproval
                  ? 'Quote ${result.quote.quoteNo} submitted — discount >5% routed to Management.'
                  : 'Quote ${result.quote.quoteNo} created (${Fmt.money(result.quote.total)}).',
            ),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
      }
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final total = widget.unit.price * (1 - _discount / 100);
    return Padding(
      padding: EdgeInsets.only(
        left: 20,
        right: 20,
        top: 20,
        bottom: MediaQuery.of(context).viewInsets.bottom + 20,
      ),
      child: Form(
        key: _formKey,
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  const Text(
                    'New quotation',
                    style: TextStyle(fontSize: 17, fontWeight: FontWeight.w700, color: AppColors.text),
                  ),
                  const Spacer(),
                  Text(
                    widget.unit.no,
                    style: const TextStyle(fontFamily: 'monospace', fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.primary),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _customer,
                decoration: const InputDecoration(labelText: 'Customer name'),
                validator: (v) => (v == null || v.trim().isEmpty) ? 'Customer name is required' : null,
              ),
              const SizedBox(height: 16),
              Text(
                'Discount — ${_discount.toStringAsFixed(0)}%',
                style: const TextStyle(fontSize: 12, color: AppColors.textMuted),
              ),
              Slider(
                value: _discount,
                min: 0,
                max: 10,
                divisions: 20,
                onChanged: (v) => setState(() => _discount = v),
              ),
              if (_discount > 5)
                Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: AppColors.warningSoft,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Row(
                      children: [
                        Icon(Icons.warning_amber_rounded, size: 15, color: AppColors.warning),
                        SizedBox(width: 6),
                        Expanded(
                          child: Text(
                            'Discount above 5% will route to Management for approval.',
                            style: TextStyle(fontSize: 11, color: AppColors.warning),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              Row(
                children: [
                  const Text(
                    'Total',
                    style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.text),
                  ),
                  const Spacer(),
                  Text(
                    Fmt.money(total),
                    style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w700, color: AppColors.primary),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              FilledButton(
                onPressed: _busy ? null : _create,
                child: _busy
                    ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                    : const Text('Create quote'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
