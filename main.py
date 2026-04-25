import flet as ft
import requests

API_KEY = "0601215667311b0dca1516d7c2d34f14"


# 🔧 BACKEND (логика работы с API)
def fetch_weather(city: str):
    url = "https://api.openweathermap.org/data/2.5/weather"

    params = {
        "q": city,
        "appid": API_KEY,
        "units": "metric",
        "lang": "ru"
    }

    try:
        response = requests.get(url, params=params)
        data = response.json()

        if response.status_code != 200:
            return {"error": data.get("message", "Ошибка API")}

        return {
            "name": data["name"],
            "temp": data["main"]["temp"],
            "desc": data["weather"][0]["description"],
            "humidity": data["main"]["humidity"],
            "wind": data["wind"]["speed"]
        }

    except Exception as e:
        return {"error": str(e)}


# 🎨 FRONTEND (Flet)
def main(page: ft.Page):
    page.title = "Погода"

    # 🌌 фон
    page.bgcolor = "#0f172a"  # тёмно-синий

    page.vertical_alignment = ft.MainAxisAlignment.CENTER
    page.horizontal_alignment = ft.CrossAxisAlignment.CENTER

    city_input = ft.TextField(
        label="Город",
        value="Almaty,KZ",
        width=300,
        border_radius=12,
        bgcolor="#1e293b",
        color="white",
        border_color="#334155",
        focused_border_color="#6366f1"
    )

    result_card = ft.Container(
        visible=False,
        padding=20,
        border_radius=20,
        width=300,
        bgcolor="#1e1b4b",  # фиолетово-синий
        shadow=ft.BoxShadow(
            blur_radius=20,
            color="#00000055",
            offset=ft.Offset(0, 5)
        )
    )

    def get_icon(desc):
        desc = desc.lower()
        if "cloud" in desc:
            return "☁"
        elif "rain" in desc:
            return "🌧"
        elif "clear" in desc:
            return "☀"
        elif "snow" in desc:
            return "❄"
        return "🌤"

    def on_click(e):
        city = city_input.value.strip()
        result = fetch_weather(city)

        if "error" in result:
            result_card.content = ft.Text(
                f"❌ {result['error']}",
                color="#f87171"
            )
        else:
            icon = get_icon(result["desc"])

            result_card.content = ft.Column(
                [
                    ft.Text(f"📍 {result['name']}", size=20, weight="bold", color="#e2e8f0"),
                    ft.Text(f"{icon} {result['desc']}", color="#cbd5f5"),
                    ft.Text(f"{result['temp']}°C", size=32, weight="bold", color="#a5b4fc"),
                    ft.Text(f"влажность - 💧  {result['humidity']}%", color="#94a3b8"),
                    ft.Text(f"ветер - 🌬 {result['wind']} м/с", color="#94a3b8"),
                ],
                alignment=ft.MainAxisAlignment.CENTER,
                horizontal_alignment=ft.CrossAxisAlignment.CENTER
            )

        result_card.visible = True
        page.update()

    btn = ft.ElevatedButton(
        "Показать погоду",
        on_click=on_click,
        style=ft.ButtonStyle(
            bgcolor="#6366f1",
            color="white",
            shape=ft.RoundedRectangleBorder(radius=12),
            padding=15
        )
    )

    page.add(
        ft.Column(
            [
                ft.Text("🌦 Погода", size=32, weight="bold", color="#e2e8f0"),
                city_input,
                btn,
                result_card
            ],
            alignment=ft.MainAxisAlignment.CENTER,
            horizontal_alignment=ft.CrossAxisAlignment.CENTER
        )
    )


ft.app(target=main)
