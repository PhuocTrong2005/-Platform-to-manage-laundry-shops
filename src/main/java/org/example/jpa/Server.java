import java.io.*;
import java.net.*;
import java.util.Base64;

public class Server {
    public static void main(String[] args) {
        try (ServerSocket serverSocket = new ServerSocket(3030)) {
            System.out.println("Server dang cho ket noi tai cong: 3030");

            try (Socket clientSocket = serverSocket.accept();
                 PrintWriter out = new PrintWriter(clientSocket.getOutputStream(), true);
                 BufferedReader in = new BufferedReader(new InputStreamReader(clientSocket.getInputStream()))) {

                System.out.println("Client da ket noi: " + clientSocket.getInetAddress());
                int sumEven = 0;

                String encodedInput;
                while ((encodedInput = in.readLine()) != null) {
                    String decodedInput = new String(Base64.getDecoder().decode(encodedInput));
                    int number = Integer.parseInt(decodedInput);
                    System.out.println("So nhan duoc tu client: " + number);

                    if (number == 0) {
                        System.out.println("Tong cac so chan nhan duoc: " + sumEven);
                        String result = "Tong cac so chan: " + sumEven;
                        out.println(Base64.getEncoder().encodeToString(result.getBytes("UTF-8")));
                        break;
                    }

                    if (number % 2 == 0) {
                        sumEven += number;
                    }
                }
            }
            System.out.println("Server da dong.");
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}