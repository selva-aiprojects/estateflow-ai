class AiAgent {
  AiAgent({
    required this.key,
    required this.name,
    required this.role,
    required this.status,
    required this.activeTasks,
    required this.successRate,
    required this.latencyMs,
    required this.lastActivity,
  });

  final String key;
  final String name;
  final String role;
  final String status;
  final int activeTasks;
  final num successRate;
  final num latencyMs;
  final String lastActivity;

  factory AiAgent.fromJson(Map<String, dynamic> j) => AiAgent(
        key: j['key'] as String? ?? '',
        name: j['name'] as String? ?? '',
        role: j['role'] as String? ?? '',
        status: j['status'] as String? ?? 'idle',
        activeTasks: (j['activeTasks'] as num?)?.toInt() ?? 0,
        successRate: (j['successRate'] as num?) ?? 0,
        latencyMs: (j['latencyMs'] as num?) ?? 0,
        lastActivity: j['lastActivity'] as String? ?? '',
      );
}

class AiInsight {
  AiInsight({
    required this.id,
    required this.agent,
    required this.tone,
    required this.title,
    required this.body,
    required this.time,
  });

  final String id;
  final String agent;
  final String tone;
  final String title;
  final String body;
  final String time;

  factory AiInsight.fromJson(Map<String, dynamic> j) => AiInsight(
        id: j['id'] as String? ?? '',
        agent: j['agent'] as String? ?? '',
        tone: j['tone'] as String? ?? 'info',
        title: j['title'] as String? ?? '',
        body: j['body'] as String? ?? '',
        time: j['time'] as String? ?? '',
      );
}

class AgentTask {
  AgentTask({
    required this.id,
    required this.agent,
    required this.title,
    required this.target,
    required this.status,
    required this.progress,
  });

  final String id;
  final String agent;
  final String title;
  final String target;
  final String status;
  final int progress;

  factory AgentTask.fromJson(Map<String, dynamic> j) => AgentTask(
        id: j['id'] as String? ?? '',
        agent: j['agent'] as String? ?? '',
        title: j['title'] as String? ?? '',
        target: j['target'] as String? ?? '',
        status: j['status'] as String? ?? 'queued',
        progress: (j['progress'] as num?)?.toInt() ?? 0,
      );
}

class AiCommandPayload {
  AiCommandPayload({required this.agents, required this.insights, required this.tasks});
  final List<AiAgent> agents;
  final List<AiInsight> insights;
  final List<AgentTask> tasks;

  factory AiCommandPayload.fromJson(Map<String, dynamic> j) => AiCommandPayload(
        agents: ((j['agents'] as List?) ?? [])
            .map((e) => AiAgent.fromJson(e as Map<String, dynamic>))
            .toList(),
        insights: ((j['insights'] as List?) ?? [])
            .map((e) => AiInsight.fromJson(e as Map<String, dynamic>))
            .toList(),
        tasks: ((j['tasks'] as List?) ?? [])
            .map((e) => AgentTask.fromJson(e as Map<String, dynamic>))
            .toList(),
      );
}
