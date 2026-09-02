# ⚽ Extremadura Stats

Plataforma web para la visualización y análisis de estadísticas del **Club Deportivo Extremadura**.

🔗 **Sitio en vivo:** [extremadurastats.es](https://extremadurastats.es)

---

## 🛠️ Tecnologías utilizadas

* **Frontend:** React
* **Backend:** Python
* **Base de datos:** MariaDB
* **Gestor de paquetes:** pnpm

---

## 🚀 Instalación y desarrollo

### Requisitos previos
* **Node.js:** v22 o superior.
* **pnpm:** Si no lo tienes activo, habilítalo ejecutando:
  ```bash
  corepack enable pnpm
  ```

### Pasos para iniciar

- Clona el repositorio e instala las dependencias:
  ```bash
  git clone https://github.com/GonzaloSurba/cdextremadura-stats-website.git
  
  cd cdextremadura-stats-website

  pnpm install
  ```
- Configura los ```.env``` tanto del frontend como del backend.
- Ejecuta el servidor de desarrollo.
  ```bash
  pnpm run dev
  ```
- Accede al backend, crea un entorno virtual y ejecuta el archivo main.py.
  ```bash
  cd backend

  python3 -m venv venv

  source venv/bin/activate

  pip install -r requirements.txt

  python3 main.py
  ```
  > Se utiliza pnpm por su gestión más estricta de dependencias, lo que evita algunos problemas producidos por los ataques a npm.
  > La base de datos MariaDB no forma parte de este repositorio. Sin embargo, el esquema puede generarse a partir de los modelos de SQLAlchemy incluidos en el backend.

---

## 🧪 Herramientas auxiliares y pruebas

Los archivos cargar_partidos.html y temporada.html no forman parte del cliente de React. Son utilidades independientes empleadas para la carga masiva de datos en MariaDB y la verificación de endpoints/consultas.

---

## 📜 Licencia y Autoría

Desarrollado por **Gonzalo Suárez Barrientos** ([@GonzaloSurba](https://github.com/GonzaloSurba)).

Este proyecto está bajo la licencia **GNU Affero General Public License v3.0 (AGPLv3)**, exceptuando algunos recursos gráficos, escudos y marcas comerciales que pertenecen a sus respectivos propietarios. Consulta el archivo [LICENSE](./LICENSE) para más detalles.

---

## Créditos y Reconocimientos

* Algunos iconos/gráficos SVG utilizados pertenecen a sus respectivos autores y mantienen su propia licencia. Puede revisarse la licencia de estos elementos en sus respectivos componentes. [Puedes verlos aquí](./src/components/Icons/).