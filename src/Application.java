
public class Application {
    public static void main(String[] args) {
        Snake game = new Snake();
        game.start();
        while (true) {
            game.play();
        }
    }
}
