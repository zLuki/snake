import java.io.IOException;
import java.io.PrintStream;
import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;


public class Snake {
    private ArrayList<Point> snake;
    private boolean needsNewFrucht;
    private int direction;


    public Snake() {
        snake = new ArrayList<Point>();
        for (int i = 0; i < 3; i++) {
            snake.add(new Point(i,0));
        }
        needsNewFrucht = true;
        direction = 1;
    }

    public void changeDirection() {
        try{
            int data = System.in.read();
            if (data == 'w' && direction != 0) direction = 0;
            else if (data == 'd' && direction != 1) direction = 1;
            else if (data == 's' && direction != 2) direction = 2;
            else if (data == 'a' && direction != 3) direction = 3;

            System.out.print(data);
        }catch(IOException e ){}
    }

    public void play() {
        if (needsNewFrucht) {
            while (true) {
                Point frucht = new Point((int) Math.floor(Math.random() * 49), (int) Math.floor(Math.random() * 49));
                if (!snake.contains(frucht)) {
                    needsNewFrucht = false;
                    break;
                }
            }
        }

        ExecutorService executorService = Executors.newSingleThreadExecutor();
        executorService.execute(this::changeDirection); //here is the Runnable (represented as simple lambda here)
        executorService.shutdown();
        try {
            if (!executorService.awaitTermination(1000, TimeUnit.MILLISECONDS)) {
                this.changeSnake();
                this.printField();
            }
        }catch(InterruptedException e){
            e.printStackTrace();
        }
    }

    public void changeSnake() {
        // Die Schlange geht ein Feld weiter
        Point nextPoint, currentPoint = snake.get(snake.size()-1);
        if (direction == 0) nextPoint = new Point(currentPoint.getX()-1, currentPoint.getY());
        else if (direction == 1) nextPoint = new Point(currentPoint.getX(), currentPoint.getY()+1);
        else if (direction == 2) nextPoint = new Point(currentPoint.getX()+1, currentPoint.getY());
        else if (direction == 3) nextPoint = new Point(currentPoint.getX(), currentPoint.getY()-1);
        else nextPoint = new Point(-1,-1);

        // Der Schwanz der Schlange wird gelöscht außer sie hat gerade die Frucht gegessen
        if (!Arrays.equals(snake.get(0).getPoint(), nextPoint.getPoint())) {
            needsNewFrucht = true;
            snake.remove(0);
        }
        // Schauen ob sich die Schlange selbst beißt
        for (Point p : snake) {
            if (Arrays.equals(p.getPoint(), nextPoint.getPoint())) {
                System.out.println("GAME OVER!");
                System.exit(0);
            }
        }
        // Alles hat gepasst
        snake.add(nextPoint);
    }

    public void printField() {
        cleanConsole();
        for (int x = 0; x < 50; x++) {
            for (int y = 0; y < 50; y++) {
                System.out.print("X");
            }
            System.out.print("\n");
        }
    }

    public void start() {
        cleanConsole();
        System.out.println(Display.getThree());
        cleanConsole(1000);
        System.out.println(Display.getTwo());
        cleanConsole(1000);
        System.out.println(Display.getOne());
        cleanConsole(1000);
        System.out.println(Display.getGo());
        cleanConsole(1000);
    }

    private void cleanConsole() {
        cleanConsole(0);
    }
    private void cleanConsole(long t) {
        try {
            Thread.sleep(t);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        try {
            new ProcessBuilder("cmd", "/c", "cls").inheritIO().start().waitFor();
        } catch (InterruptedException | IOException e) {
            e.printStackTrace();
        }
    }
}
