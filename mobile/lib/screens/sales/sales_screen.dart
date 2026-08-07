import 'package:flutter/material.dart';

import 'sales_inventory.dart';
import 'sales_leads.dart';
import 'sales_quotes.dart';

class SalesScreen extends StatefulWidget {
  const SalesScreen({super.key});

  @override
  State<SalesScreen> createState() => _SalesScreenState();
}

class _SalesScreenState extends State<SalesScreen> {
  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 3,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Sales'),
          bottom: const TabBar(
            tabs: [
              Tab(text: 'Leads'),
              Tab(text: 'Quotes'),
              Tab(text: 'Inventory'),
            ],
          ),
        ),
        body: const SafeArea(
          child: TabBarView(
            children: [
              LeadsTab(),
              QuotesTab(),
              InventoryTab(),
            ],
          ),
        ),
      ),
    );
  }
}
