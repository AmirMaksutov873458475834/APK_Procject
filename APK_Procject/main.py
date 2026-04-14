import flet as ft

def main(page: ft.Page):
    page.title = "My App"
    page.add(ft.Text("Привет, это моё приложение 🚀"))

ft.app(target=main)