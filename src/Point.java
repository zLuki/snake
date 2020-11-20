public class Point {
    private int x;
    private int y;

    public Point(int x, int y) {

        if (x < 0 || x > 49 || y < 0 || y > 49) {
            System.out.println("GAME OVER!");
            System.exit(0);
        }
        this.x = x;
        this.y = y;
    }
    public int getX() {
        return x;
    }
    public int getY() {
        return y;
    }

    public int[] getPoint() {
        return new int[]{x,y};
    }

}
