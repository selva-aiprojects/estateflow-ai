import 'package:flutter/material.dart';

import '../../core/format.dart';
import '../../core/theme.dart';
import '../../models/portal.dart';
import '../../state/app_scope.dart';
import '../../widgets/async_loader.dart';
import '../../widgets/common.dart';
import 'portal_sections.dart';

class PortalScreen extends StatefulWidget {
  const PortalScreen({super.key});

  @override
  State<PortalScreen> createState() => _PortalScreenState();
}

class _PortalScreenState extends State<PortalScreen> {
  int _reloadKey = 0;

  Future<PortalPayload> _load() =>
      AppScope.of(context).api.portal();

  @override
  Widget build(BuildContext context) {
    final session = AppScope.of(context).session;
    return Scaffold(
      body: SafeArea(
        child: AsyncLoader<PortalPayload>(
          key: ValueKey(_reloadKey),
          load: _load,
          onError: 'Portal unavailable',
          builder: (context, p) => _buildBody(context, p, session.displayName),
        ),
      ),
    );
  }

  Widget _buildBody(BuildContext context, PortalPayload p, String displayName) {
    final nextDue = p.instalments.where((i) => !i.paid).toList()
      ..sort((a, b) => a.due.compareTo(b.due));
    return CustomScrollView(
      slivers: [
        SliverPadding(
          padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
          sliver: SliverToBoxAdapter(
            child: _Header(p: p, displayName: displayName),
          ),
        ),
        SliverPadding(
          padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
          sliver: SliverToBoxAdapter(
            child: _UnitCard(p: p),
          ),
        ),
        if (nextDue.isNotEmpty)
          SliverPadding(
            padding: const EdgeInsets.fromLTRB(20, 14, 20, 0),
            sliver: SliverToBoxAdapter(
              child: _NextDue(
                instalment: nextDue.first,
                onPay: () => _openSection(context, PortalSection.payments, p),
              ),
            ),
          ),
        SliverPadding(
          padding: const EdgeInsets.fromLTRB(20, 14, 20, 0),
          sliver: SliverToBoxAdapter(
            child: _ProgressCard(p: p),
          ),
        ),
        SliverPadding(
          padding: const EdgeInsets.fromLTRB(20, 24, 20, 8),
          sliver: SliverToBoxAdapter(
            child: Text(
              'Everything you need',
              style: TextStyle(
                fontSize: 17,
                fontWeight: FontWeight.w700,
                color: AppColors.text,
              ),
            ),
          ),
        ),
        SliverPadding(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          sliver: SliverGrid(
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              mainAxisSpacing: 12,
              crossAxisSpacing: 12,
              childAspectRatio: 1.55,
            ),
            delegate: SliverChildListDelegate(
              _menuItems(context, p).map((item) => _MenuTile(item)).toList(),
            ),
          ),
        ),
        const SliverPadding(padding: EdgeInsets.only(bottom: 32)),
      ],
    );
  }

  List<_MenuItem> _menuItems(BuildContext context, PortalPayload p) {
    return [
      _MenuItem(Icons.receipt_long_outlined, 'Statement', () => _openSection(context, PortalSection.statement, p)),
      _MenuItem(Icons.payments_outlined, 'Payments & tax', () => _openSection(context, PortalSection.payments, p)),
      _MenuItem(Icons.support_agent_outlined, 'Support', () => _openSection(context, PortalSection.support, p)),
      _MenuItem(Icons.photo_camera_outlined, 'Site updates', () => _openSection(context, PortalSection.updates, p)),
      _MenuItem(Icons.home_work_outlined, 'Possession', () => _openSection(context, PortalSection.possession, p)),
      _MenuItem(Icons.badge_outlined, 'KYC', () => _openSection(context, PortalSection.kyc, p)),
      _MenuItem(Icons.chat_outlined, 'Ask AI', () => _openSection(context, PortalSection.chat, p)),
      _MenuItem(Icons.event_outlined, 'Events', () => _openSection(context, PortalSection.events, p)),
      _MenuItem(Icons.card_giftcard_outlined, 'Rewards', () => _openSection(context, PortalSection.rewards, p)),
      _MenuItem(Icons.sell_outlined, 'Marketplace', () => _openSection(context, PortalSection.marketplace, p)),
      _MenuItem(Icons.account_balance_outlined, 'Home loans', () => _openSection(context, PortalSection.loans, p)),
      _MenuItem(Icons.verified_outlined, 'Warranty', () => _openSection(context, PortalSection.warranty, p)),
      _MenuItem(Icons.folder_outlined, 'Documents', () => _openSection(context, PortalSection.documents, p)),
      _MenuItem(Icons.pool_outlined, 'Amenities', () => _openSection(context, PortalSection.amenities, p)),
    ];
  }

  Future<void> _openSection(
      BuildContext context, PortalSection section, PortalPayload p) async {
    final changed = await Navigator.of(context).push<bool>(
      MaterialPageRoute(builder: (_) => PortalSectionScreen(section: section, payload: p)),
    );
    if (changed == true) {
      setState(() => _reloadKey++);
    }
  }
}

class _Header extends StatelessWidget {
  const _Header({required this.p, required this.displayName});

  final PortalPayload p;
  final String displayName;

  @override
  Widget build(BuildContext context) {
    final kycVerified = p.kyc.status == 'verified';
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Hi $displayName 👋'.replaceAll(' 👋', ''),
                    style: const TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.w700,
                      color: AppColors.text,
                    ),
                  ),
                  const SizedBox(height: 3),
                  Text(
                    p.unit.project,
                    style: const TextStyle(fontSize: 13, color: AppColors.textMuted),
                  ),
                ],
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(999),
                border: Border.all(color: AppColors.border),
              ),
              child: Row(
                children: [
                  Icon(
                    kycVerified ? Icons.verified_rounded : Icons.error_outline_rounded,
                    size: 14,
                    color: kycVerified ? AppColors.success : AppColors.warning,
                  ),
                  const SizedBox(width: 5),
                  Text(
                    kycVerified ? 'KYC verified' : 'KYC pending',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: kycVerified ? AppColors.success : AppColors.warning,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: 14),
        Row(
          children: [
            _LoyaltyChip(p: p),
            const SizedBox(width: 8),
            StatusPill(
              label: 'Loyalty ${p.loyalty.tier.toUpperCase()}',
              color: AppColors.accent,
            ),
          ],
        ),
      ],
    );
  }
}

class _LoyaltyChip extends StatelessWidget {
  const _LoyaltyChip({required this.p});
  final PortalPayload p;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          Icon(Icons.stars_rounded, size: 14, color: AppColors.accent),
          const SizedBox(width: 5),
          Text(
            '${p.loyalty.points} pts',
            style: const TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w600,
              color: AppColors.text,
            ),
          ),
        ],
      ),
    );
  }
}

class _UnitCard extends StatelessWidget {
  const _UnitCard({required this.p});
  final PortalPayload p;

  @override
  Widget build(BuildContext context) {
    return Container(
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
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  p.unit.no,
                  style: const TextStyle(
                    fontFamily: 'monospace',
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: Colors.white,
                  ),
                ),
              ),
              const Spacer(),
              StatusPill(
                label: p.unit.type,
                color: Colors.white,
                dark: true,
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              _UnitFact(icon: Icons.crop_square, label: 'Area', value: '${p.unit.sqft} sq ft'),
              _UnitFact(icon: Icons.flight_takeoff, label: 'Floor', value: p.unit.floor),
              _UnitFact(icon: Icons.currency_rupee, label: 'Price', value: Fmt.moneyCompact(p.unit.price)),
            ],
          ),
        ],
      ),
    );
  }
}

class _UnitFact extends StatelessWidget {
  const _UnitFact({required this.icon, required this.label, required this.value});
  final IconData icon;
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, size: 14, color: Colors.white.withValues(alpha: 0.55)),
              const SizedBox(width: 5),
              Text(
                label.toUpperCase(),
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.w600,
                  letterSpacing: 0.4,
                  color: Colors.white.withValues(alpha: 0.55),
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: Colors.white,
            ),
          ),
        ],
      ),
    );
  }
}

class _NextDue extends StatelessWidget {
  const _NextDue({required this.instalment, required this.onPay});
  final PortalInstalment instalment;
  final VoidCallback onPay;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.primarySoft,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.primary.withValues(alpha: 0.25)),
      ),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: AppColors.primary,
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Icon(Icons.schedule_rounded, color: Colors.white, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Next payment · ${instalment.name}',
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: AppColors.text,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  '${Fmt.money(instalment.amount)} due ${Fmt.date(instalment.due)}',
                  style: const TextStyle(fontSize: 12, color: AppColors.textMuted),
                ),
              ],
            ),
          ),
          FilledButton(
            onPressed: onPay,
            style: FilledButton.styleFrom(
              backgroundColor: AppColors.primary,
              minimumSize: const Size(0, 40),
              padding: const EdgeInsets.symmetric(horizontal: 16),
            ),
            child: const Text('Pay'),
          ),
        ],
      ),
    );
  }
}

class _ProgressCard extends StatelessWidget {
  const _ProgressCard({required this.p});
  final PortalPayload p;

  @override
  Widget build(BuildContext context) {
    final latest = p.milestones.lastOrNull;
    return SectionCard(
      title: 'Construction progress',
      trailing: latest != null
          ? Text(
              '${latest.progress}%',
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w700,
                color: AppColors.primary,
              ),
            )
          : null,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (latest != null)
            Text(
              latest.name,
              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.text),
            ),
          const SizedBox(height: 8),
          ProgressBar(value: (latest?.progress ?? 0) / 100),
          const SizedBox(height: 14),
          for (final m in p.milestones.take(4))
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 4),
              child: _MilestoneRow(m),
            ),
        ],
      ),
    );
  }
}

class _MilestoneRow extends StatelessWidget {
  const _MilestoneRow(this.m);
  final Milestone m;

  @override
  Widget build(BuildContext context) {
    final done = m.status == 'completed';
    return Row(
      children: [
        Icon(
          done ? Icons.check_circle_rounded : Icons.radio_button_unchecked_rounded,
          size: 16,
          color: done ? AppColors.success : AppColors.textSubtle,
        ),
        const SizedBox(width: 8),
        Expanded(
          child: Text(
            m.name,
            style: TextStyle(
              fontSize: 13,
              fontWeight: done ? FontWeight.w600 : FontWeight.w400,
              color: done ? AppColors.text : AppColors.textMuted,
            ),
          ),
        ),
        Text(
          done ? 'Done' : '${m.progress}%',
          style: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w600,
            color: done ? AppColors.success : AppColors.textSubtle,
          ),
        ),
      ],
    );
  }
}

class _MenuTile extends StatelessWidget {
  const _MenuTile(this.item);
  final _MenuItem item;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: AppColors.surface,
      borderRadius: BorderRadius.circular(12),
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: item.onTap,
        child: Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppColors.border),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                width: 34,
                height: 34,
                decoration: BoxDecoration(
                  color: AppColors.primarySoft,
                  borderRadius: BorderRadius.circular(9),
                ),
                child: Icon(item.icon, size: 18, color: AppColors.primary),
              ),
              Text(
                item.label,
                maxLines: 2,
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: AppColors.text,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _MenuItem {
  const _MenuItem(this.icon, this.label, this.onTap);
  final IconData icon;
  final String label;
  final VoidCallback onTap;
}
