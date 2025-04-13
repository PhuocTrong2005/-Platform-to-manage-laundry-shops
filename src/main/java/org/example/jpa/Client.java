import java.io.*;
import java.net.*;
import java.util.Base64;
import java.util.Scanner;

public class Client {
    public static void main(String[] args) {
        try (Socket socket = new Socket("localhost", 3030);
             PrintWriter out = new PrintWriter(socket.getOutputStream(), true);
             BufferedReader in = new BufferedReader(new InputStreamReader(socket.getInputStream()));
             Scanner scanner = new Scanner(System.in)) {

            System.out.println("Da ket noi den server: localhost:3030");

            while (true) {
                System.out.print("Nhap mot so nguyen (0 de ket thuc) - NHAP TUNG SO MOT: ");
                if (scanner.hasNextInt()) {
                    int number = scanner.nextInt();
                    scanner.nextLine(); // Xóa bộ đệm

                    String encodedNumber = Base64.getEncoder().encodeToString(String.valueOf(number).getBytes("UTF-8"));
                    out.println(encodedNumber);

                    if (number == 0) {
                        // Nhận và hiển thị kết quả từ server
                        String encodedResult = in.readLine();
                        String decodedResult = new String(Base64.getDecoder().decode(encodedResult));
                        System.out.println("\nKet qua tu Server:");
                        System.out.println(decodedResult);
                        break;
                    }
                } else {
                    System.out.println("Vui long nhap mot so nguyen hop le!");
                    scanner.nextLine();
                }
            }
            System.out.println("Client da dong.");
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}