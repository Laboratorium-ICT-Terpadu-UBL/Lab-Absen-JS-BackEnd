#include <SPI.h>
#include <MFRC522.h>
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>

#define RST_PIN D1
#define SDA_PIN D2
#define BUZZER_DURATION 200
#define BUZZER_PIN D8

const char* ssid = "Ruang_Staff I";
const char* password = "staffjungle2023";

const char* serverName = "http://192.168.134.20:3001/api/rfidFetch";

unsigned long lastTime = 0;
unsigned long timerDelay = 5000;
int wifiCheck = 0;

MFRC522 mfrc522(SDA_PIN, RST_PIN);

void setup() {
  Serial.begin(9600);
  SPI.begin();

  pinMode(BUZZER_PIN, OUTPUT);

  mfrc522.PCD_Init();

  WiFi.begin(ssid, password);
  Serial.println("Connecting");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  buzzerRinger(2);

  Serial.println("");
  Serial.print("Connected to WiFi network with IP Address: ");
  Serial.println(WiFi.localIP());
  Serial.println(WiFi.macAddress());
  Serial.println("Timer set to 5 seconds (timerDelay variable), it will take 5 seconds before publishing the first reading.");
  Serial.println("Put your card to the reader...");
}

String toHex(byte* buffer, byte bufferSize) {
  String result;
  for (byte i = 0; i < bufferSize; i++) {
    result += (buffer[i] < 0x10 ? "0" : "");
    result += String(buffer[i], HEX);
  }
  result.toUpperCase();
  return result;
}

void buzzerRinger(int ringingTimes) {
  for (int i = 0; i < ringingTimes; i++) {
    digitalWrite(BUZZER_PIN, HIGH);
    delay(BUZZER_DURATION);
    digitalWrite(BUZZER_PIN, LOW);
    delay(500);
  }
}

void httpSender(String cardTag) {
  if ((millis() - lastTime) > timerDelay) {
    //Check WiFi connection status
    if (WiFi.status() == WL_CONNECTED) {
      WiFiClient client;
      HTTPClient http;

      if (http.begin(client, serverName)) {
        http.addHeader("Content-Type", "application/json");
        http.addHeader("Accept", "application/json");
        int httpResponseCode = http.POST("{\"serialCard\":\"" + cardTag + "\", \"macDevice\":\"" + WiFi.macAddress() + "\"}");
        if (httpResponseCode > 0) {
          buzzerRinger(1);
          Serial.println(http.getString());
        } else {
          buzzerRinger(4);
        }
        Serial.print("HTTP Response code: ");
        Serial.println(httpResponseCode);
        http.end();
      } else {
        buzzerRinger(5);
        Serial.printf("[HTTPS] Unable to connect\n");
      }

    } else {
      buzzerRinger(3);
      Serial.println("WiFi Disconnected");
    }
    lastTime = millis();
  }
}

void loop() {
  if (!mfrc522.PICC_IsNewCardPresent()) {
    return;
  }

  if (!mfrc522.PICC_ReadCardSerial()) {
    return;
  }

  String converted = toHex(mfrc522.uid.uidByte, mfrc522.uid.size);
  Serial.println("UID tag :" + converted);
  httpSender(converted);

  delay(5000);
}