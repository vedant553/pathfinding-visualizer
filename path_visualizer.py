import pygame
import heapq

WINDOW_SIZE = 800
ROWS = 40
GRID_MARGIN = 40
GRID_SIZE = WINDOW_SIZE - GRID_MARGIN * 2
NODE_SIZE = GRID_SIZE // ROWS
PATH_DELAY_MS = 25
BG_COLOR = (28, 28, 28)
GRID_LINE_COLOR = (80, 80, 80)
EMPTY_COLOR = (28, 28, 28)
START_COLOR = (255, 165, 0)
END_COLOR = (64, 224, 208)
BARRIER_COLOR = (10, 10, 40)
OPEN_COLOR = (0, 200, 100)
CLOSED_COLOR = (200, 50, 50)
PATH_COLOR = (140, 0, 255)
TEXT_COLOR = (200, 200, 200)
FONT_SIZE = 20
CONTROLS_TEXT = "Left Click: Set Start/End/Barriers | Right Click: Erase | Space: Run Algorithm | C: Clear"

class Node:
    def __init__(self, row, col):
        self.row = row
        self.col = col
        self.x = GRID_MARGIN + col * NODE_SIZE
        self.y = GRID_MARGIN + row * NODE_SIZE
        self.color = EMPTY_COLOR
        self.neighbors = []

    def get_pos(self):
        return self.row, self.col

    def is_closed(self):
        return self.color == CLOSED_COLOR

    def is_open(self):
        return self.color == OPEN_COLOR

    def is_barrier(self):
        return self.color == BARRIER_COLOR

    def is_start(self):
        return self.color == START_COLOR

    def is_end(self):
        return self.color == END_COLOR

    def reset(self):
        self.color = EMPTY_COLOR

    def make_start(self):
        self.color = START_COLOR

    def make_closed(self):
        self.color = CLOSED_COLOR

    def make_open(self):
        self.color = OPEN_COLOR

    def make_barrier(self):
        self.color = BARRIER_COLOR

    def make_end(self):
        self.color = END_COLOR

    def make_path(self):
        self.color = PATH_COLOR

    def draw(self, win):
        pygame.draw.rect(win, self.color, (self.x, self.y, NODE_SIZE, NODE_SIZE))

    def update_neighbors(self, grid):
        self.neighbors = []
        if self.row > 0 and not grid[self.row - 1][self.col].is_barrier():
            self.neighbors.append(grid[self.row - 1][self.col])
        if self.row < ROWS - 1 and not grid[self.row + 1][self.col].is_barrier():
            self.neighbors.append(grid[self.row + 1][self.col])
        if self.col > 0 and not grid[self.row][self.col - 1].is_barrier():
            self.neighbors.append(grid[self.row][self.col - 1])
        if self.col < ROWS - 1 and not grid[self.row][self.col + 1].is_barrier():
            self.neighbors.append(grid[self.row][self.col + 1])

    def __lt__(self, other):
        return False

def heuristic(p1, p2):
    return abs(p1[0] - p2[0]) + abs(p1[1] - p2[1])

def reconstruct_path(came_from, current, draw):
    while current in came_from:
        current = came_from[current]
        if current.is_start():
            break
        current.make_path()
        draw()
        pygame.time.delay(PATH_DELAY_MS)
        pygame.event.pump()

def algorithm(draw, grid, start, end):
    count = 0
    open_set = []
    heapq.heappush(open_set, (0, count, start))
    came_from = {}
    g_score = {node: float("inf") for row in grid for node in row}
    g_score[start] = 0
    f_score = {node: float("inf") for row in grid for node in row}
    f_score[start] = heuristic(start.get_pos(), end.get_pos())
    open_set_hash = {start}
    while open_set:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                return False
        current = heapq.heappop(open_set)[2]
        open_set_hash.remove(current)
        if current == end:
            reconstruct_path(came_from, end, draw)
            end.make_end()
            start.make_start()
            return True
        for neighbor in current.neighbors:
            temp_g_score = g_score[current] + 1
            if temp_g_score < g_score[neighbor]:
                came_from[neighbor] = current
                g_score[neighbor] = temp_g_score
                f_score[neighbor] = temp_g_score + heuristic(neighbor.get_pos(), end.get_pos())
                if neighbor not in open_set_hash:
                    count += 1
                    heapq.heappush(open_set, (f_score[neighbor], count, neighbor))
                    open_set_hash.add(neighbor)
                    if not neighbor.is_end():
                        neighbor.make_open()
        draw()
        if not current.is_start():
            current.make_closed()
    return False

def make_grid():
    return [[Node(i, j) for j in range(ROWS)] for i in range(ROWS)]

def draw_grid_lines(win):
    for i in range(ROWS + 1):
        offset = GRID_MARGIN + i * NODE_SIZE
        pygame.draw.line(win, GRID_LINE_COLOR, (GRID_MARGIN, offset), (GRID_MARGIN + GRID_SIZE, offset), 1)
        pygame.draw.line(win, GRID_LINE_COLOR, (offset, GRID_MARGIN), (offset, GRID_MARGIN + GRID_SIZE), 1)

def draw(win, grid, font):
    win.fill(BG_COLOR)
    for row in grid:
        for node in row:
            node.draw(win)
    draw_grid_lines(win)
    instructions_surface = font.render(CONTROLS_TEXT, True, TEXT_COLOR)
    instructions_rect = instructions_surface.get_rect(center=(WINDOW_SIZE // 2, WINDOW_SIZE - GRID_MARGIN // 2))
    win.blit(instructions_surface, instructions_rect)
    pygame.display.update()

def get_clicked_pos(pos):
    x, y = pos
    if x < GRID_MARGIN or x >= GRID_MARGIN + GRID_SIZE or y < GRID_MARGIN or y >= GRID_MARGIN + GRID_SIZE:
        return None
    row = (y - GRID_MARGIN) // NODE_SIZE
    col = (x - GRID_MARGIN) // NODE_SIZE
    return row, col

def main():
    pygame.init()
    win = pygame.display.set_mode((WINDOW_SIZE, WINDOW_SIZE))
    pygame.display.set_caption("Modern Pathfinding Algorithm Visualizer")
    font = pygame.font.SysFont(None, FONT_SIZE)
    grid = make_grid()
    start = None
    end = None
    running = True
    while running:
        draw(win, grid, font)
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
            if event.type == pygame.KEYDOWN:
                if event.key == pygame.K_SPACE and start and end:
                    for row in grid:
                        for node in row:
                            node.update_neighbors(grid)
                    algorithm(lambda: draw(win, grid, font), grid, start, end)
                if event.key == pygame.K_c:
                    grid = make_grid()
                    start = None
                    end = None
        left, _, right = pygame.mouse.get_pressed()
        if left:
            pos = pygame.mouse.get_pos()
            clicked = get_clicked_pos(pos)
            if clicked:
                row, col = clicked
                node = grid[row][col]
                if not start and node != end:
                    start = node
                    start.make_start()
                elif not end and node != start:
                    end = node
                    end.make_end()
                elif node != start and node != end:
                    node.make_barrier()
        elif right:
            pos = pygame.mouse.get_pos()
            clicked = get_clicked_pos(pos)
            if clicked:
                row, col = clicked
                node = grid[row][col]
                node.reset()
                if node == start:
                    start = None
                if node == end:
                    end = None
    pygame.quit()

if __name__ == "__main__":
    main()
