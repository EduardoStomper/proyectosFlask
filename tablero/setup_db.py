#!/usr/bin/env python3
"""
Script para configurar la base de datos PostgreSQL
Ejecutar después de crear la base de datos manualmente
"""

import psycopg2
import sys
import os
from config import Config

def test_connection():
    """Probar conexión a la base de datos"""
    try:
        conn = psycopg2.connect(
            host=Config.DATABASE_HOST,
            port=Config.DATABASE_PORT,
            database=Config.DATABASE_NAME,
            user=Config.DATABASE_USER,
            password=Config.DATABASE_PASSWORD
        )
        conn.close()
        print("✅ Conexión a PostgreSQL exitosa")
        return True
    except Exception as e:
        print(f"❌ Error conectando a PostgreSQL: {e}")
        return False

def run_sql_script():
    """Ejecutar el script SQL para crear las tablas"""
    try:
        # Leer el archivo SQL
        with open('database.sql', 'r', encoding='utf-8') as file:
            sql_script = file.read()
        
        # Conectar y ejecutar
        conn = psycopg2.connect(
            host=Config.DATABASE_HOST,
            port=Config.DATABASE_PORT,
            database=Config.DATABASE_NAME,
            user=Config.DATABASE_USER,
            password=Config.DATABASE_PASSWORD
        )
        
        cursor = conn.cursor()
        
        # Ejecutar el script completo
        cursor.execute(sql_script)
        conn.commit()
        
        cursor.close()
        conn.close()
        
        print("✅ Script SQL ejecutado correctamente")
        print("✅ Tablas creadas y datos iniciales insertados")
        return True
        
    except Exception as e:
        print(f"❌ Error ejecutando script SQL: {e}")
        return False

def verify_installation():
    """Verificar que las tablas se crearon correctamente"""
    try:
        conn = psycopg2.connect(
            host=Config.DATABASE_HOST,
            port=Config.DATABASE_PORT,
            database=Config.DATABASE_NAME,
            user=Config.DATABASE_USER,
            password=Config.DATABASE_PASSWORD
        )
        
        cursor = conn.cursor()
        
        # Verificar tablas principales
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
            ORDER BY table_name
        """)
        
        tables = cursor.fetchall()
        expected_tables = [
            'categories', 'questions', 'question_options', 'teams',
            'game_sessions', 'session_teams', 'question_responses'
        ]
        
        print("\n📋 Tablas creadas:")
        for table in tables:
            table_name = table[0]
            status = "✅" if table_name in expected_tables else "ℹ️"
            print(f"  {status} {table_name}")
        
        # Verificar datos iniciales
        cursor.execute("SELECT COUNT(*) FROM categories")
        categories_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM questions")
        questions_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM teams")
        teams_count = cursor.fetchone()[0]
        
        print(f"\n📊 Datos iniciales:")
        print(f"  📂 Categorías: {categories_count}")
        print(f"  ❓ Preguntas: {questions_count}")
        print(f"  👥 Equipos: {teams_count}")
        
        cursor.close()
        conn.close()
        
        return True
        
    except Exception as e:
        print(f"❌ Error verificando instalación: {e}")
        return False

def main():
    print("🚀 Configurando base de datos PostgreSQL para el sistema de preguntas...")
    print(f"📡 Conectando a: {Config.DATABASE_HOST}:{Config.DATABASE_PORT}/{Config.DATABASE_NAME}")
    
    # Verificar archivo .env
    if not os.path.exists('.env'):
        print("⚠️  Archivo .env no encontrado")
        print("📝 Copia .env.example a .env y configura tus credenciales de PostgreSQL")
        return False
    
    # Paso 1: Probar conexión
    if not test_connection():
        print("\n💡 Instrucciones:")
        print("1. Asegúrate de que PostgreSQL esté instalado y ejecutándose")
        print("2. Crea la base de datos manualmente:")
        print(f"   CREATE DATABASE {Config.DATABASE_NAME};")
        print("3. Configura las credenciales en el archivo .env")
        return False
    
    # Paso 2: Ejecutar script SQL
    print("\n🔧 Ejecutando script SQL...")
    if not run_sql_script():
        return False
    
    # Paso 3: Verificar instalación
    print("\n🔍 Verificando instalación...")
    if not verify_installation():
        return False
    
    print("\n🎉 ¡Base de datos configurada correctamente!")
    print("🚀 Ya puedes ejecutar la aplicación con: python app.py")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)