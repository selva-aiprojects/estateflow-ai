import 'package:flutter/material.dart';

import 'common.dart';

class AsyncLoader<T> extends StatefulWidget {
  const AsyncLoader({
    super.key,
    required this.load,
    required this.builder,
    this.onError,
    this.slivers = false,
    this.padding,
  });

  final Future<T> Function() load;
  final Widget Function(BuildContext, T) builder;
  final String? onError;
  final bool slivers;
  final EdgeInsets? padding;

  @override
  State<AsyncLoader<T>> createState() => _AsyncLoaderState<T>();
}

class _AsyncLoaderState<T> extends State<AsyncLoader<T>> {
  late Future<T> _future = widget.load();
  int _attempt = 0;

  void _reload() {
    setState(() {
      _attempt++;
      _future = widget.load();
    });
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<T>(
      key: ValueKey(_attempt),
      future: _future,
      builder: (context, snap) {
        if (snap.connectionState != ConnectionState.done) {
          return const LoadingBlock();
        }
        if (snap.hasError) {
          return ErrorRetry(
            message: widget.onError ?? snap.error.toString(),
            onRetry: _reload,
          );
        }
        final data = snap.data;
        if (data == null) {
          return const ErrorRetry(
            message: 'Empty response from server',
            onRetry: _noop,
          );
        }
        return widget.builder(context, data);
      },
    );
  }

  static void _noop() {}
}
