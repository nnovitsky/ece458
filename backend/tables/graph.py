from collections import defaultdict


class Graph():
    def __init__(self, vertices):
        self.graph = defaultdict(list)
        self.V = vertices

    def add_edge(self, u, v):
        self.graph[u].append(v)

    def is_cyclic_helper(self, v, visited, stack):

        visited[v] = True
        stack[v] = True

        for neighbor in self.graph[v]:
            if not visited[neighbor]:
                if self.is_cyclic_helper(neighbor, visited, stack):
                    return True
                elif stack[neighbor]:
                    return True

        stack[v] = False
        return False

    def is_cyclic(self):
        visited = [False] * self.V
        stack = [False] * self.V

        for node in range(self.V):
            if not visited[node]:
                if self.is_cyclic_helper(node, visited, stack):
                    return True

        return False
