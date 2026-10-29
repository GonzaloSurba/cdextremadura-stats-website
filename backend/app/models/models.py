# ExtremaduraStats
# Copyright (C) 2026 Gonzalo Suárez Barrientos <suarezbarrientosgonzalo@gmail.com>
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
"""
Modelos SQLAlchemy — uno por tabla del schema.
Importa este módulo en alembic/env.py para que detecte los modelos.
"""

from datetime import date, datetime
from enum import StrEnum

from sqlalchemy import (
    Enum,
    ForeignKey,
    String,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base

# ── Enums ────────────────────────────────────────────────────────────────────

class TipoCompeticion(StrEnum):
    liga = "liga"
    copa = "copa"
    fase = "fase"
    amistoso = "amistoso"


class EstadoPartido(StrEnum):
    jugado = "jugado"
    aplazado = "aplazado"
    suspendido = "suspendido"
    programado = "programado"


class TipoGol(StrEnum):
    normal = "normal"
    penalti = "penalti"
    falta_directa = "falta_directa"
    propia_puerta = "propia_puerta"


class TipoTarjeta(StrEnum):
    amarilla = "amarilla"
    roja = "roja"
    doble_amarilla = "doble_amarilla"


class PieDominante(StrEnum):
    zurdo = "zurdo"
    diestro = "diestro"
    ambidiestro = "ambidiestro"


class RolPosicion(StrEnum):
    portero = "portero"
    defensa = "defensa"
    centro_del_campo = "centro del campo"
    ataque = "ataque"


class EstadoJugador(StrEnum):
    activo = "activo"
    cedido = "cedido"
    lesionado = "lesionado"
    baja = "baja"


class TipoEntrenador(StrEnum):
    principal = "principal"
    segundo = "segundo"
    otros = "otros"


# ── Tablas independientes ─────────────────────────────────────────────────────

class Temporada(Base):
    __tablename__ = "temporadas"

    # id = Column(Integer, primary_key=True, autoincrement=True) # Así era en SQLAlchemy antes de la versión 2.0
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    nombre: Mapped[str] = mapped_column(String(255))
    fecha_inicio: Mapped[date]
    fecha_fin: Mapped[date]

    # competiciones_temporada = relationship("CompeticionTemporada", back_populates="temporada_rel") # Así era en SQLAlchemy antes de la versión 2.0
    competiciones_temporada: Mapped[list["CompeticionTemporada"]] = relationship(back_populates="temporada_rel")
    jugadores_temporadas: Mapped[list["JugadorTemporada"]] = relationship(back_populates="temporada_rel")
    entrenadores_temporadas: Mapped[list["EntrenadorTemporada"]] = relationship(back_populates="temporada_rel")


class Competicion(Base):
    __tablename__ = "competiciones"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    nombre: Mapped[str] = mapped_column(String(255))
    pais: Mapped[str] = mapped_column(String(100))
    tipo: Mapped[TipoCompeticion] = mapped_column(Enum(TipoCompeticion))
    oficial: Mapped[bool] = mapped_column(default=False)

    ediciones: Mapped[list["CompeticionTemporada"]] = relationship(back_populates="competicion_rel")


class CompeticionTemporada(Base):
    __tablename__ = "competicion_temporada"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    competicion: Mapped[int] = mapped_column(ForeignKey("competiciones.id"))
    temporada: Mapped[int] = mapped_column(ForeignKey("temporadas.id"))
    num_jornadas: Mapped[int | None]
    num_equipos: Mapped[int | None]
    grupo: Mapped[int | None]
    ascenso: Mapped[bool | None] = mapped_column(default=None)
    descenso: Mapped[bool | None] = mapped_column(default=None)

    competicion_rel: Mapped["Competicion"] = relationship(back_populates="ediciones")
    temporada_rel: Mapped["Temporada"] = relationship(back_populates="competiciones_temporada")
    partidos: Mapped[list["Partido"]] = relationship(back_populates="competicion_temporada_rel")
    trofeos: Mapped[list["Trofeo"]] = relationship(back_populates="competicion_temporada_rel")


class Equipo(Base):
    __tablename__ = "equipos"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    nombre: Mapped[str] = mapped_column(String(255))
    abreviacion: Mapped[str] = mapped_column(String(4))
    nombre_corto: Mapped[str | None] = mapped_column(String(100))
    ruta_escudo: Mapped[str | None] = mapped_column(String(255))
    localidad: Mapped[str | None] = mapped_column(String(255))
    pais: Mapped[str | None] = mapped_column(String(100))
    equipo_principal: Mapped[bool] = mapped_column(default=False)
    estadio: Mapped[str | None] = mapped_column(String(255))

    partidos_local: Mapped[list["Partido"]] = relationship(foreign_keys="Partido.equipo_local", back_populates="equipo_local_rel")
    partidos_visitante: Mapped[list["Partido"]] = relationship(foreign_keys="Partido.equipo_visitante", back_populates="equipo_visitante_rel")


class Posicion(Base):
    __tablename__ = "posiciones"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    nombre: Mapped[str] = mapped_column(String(100))
    abreviacion: Mapped[str] = mapped_column(String(4))
    rol: Mapped[RolPosicion] = mapped_column(Enum(RolPosicion, values_callable=lambda x: [e.value for e in x]))

    jugadores: Mapped[list["JugadorPosicion"]] = relationship(back_populates="posicion_rel")


# ── Entrenadores ──────────────────────────────────────────────────────────────

class Entrenador(Base):
    __tablename__ = "entrenadores"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    nombre: Mapped[str] = mapped_column(String(255))
    apellidos: Mapped[str] = mapped_column(String(255))
    nombre_conocido: Mapped[str | None] = mapped_column(String(200))
    nacionalidad: Mapped[str | None] = mapped_column(String(100))
    fecha_nacimiento: Mapped[date | None]
    ruta_foto: Mapped[str | None] = mapped_column(String(255))
    localidad_nacimiento: Mapped[str | None] = mapped_column(String(255))

    temporadas_rel: Mapped[list["EntrenadorTemporada"]] = relationship(back_populates="entrenadores_temporadas")
    partidos_como_local: Mapped[list["Partido"]] = relationship(foreign_keys="Partido.entrenador_local", back_populates="entrenador_local_rel")
    partidos_como_visit: Mapped[list["Partido"]] = relationship(foreign_keys="Partido.entrenador_visitante", back_populates="entrenador_visitante_rel")


class EntrenadorTemporada(Base):
    __tablename__ = "entrenadores_temporadas"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    entrenador: Mapped[int] = mapped_column(ForeignKey("entrenadores.id"))
    temporada: Mapped[int] = mapped_column(ForeignKey("temporadas.id"))
    tipo: Mapped[TipoEntrenador] = mapped_column(Enum(TipoEntrenador), default=TipoEntrenador.principal)
    entrenador_equipo_principal: Mapped[bool] = mapped_column(default=False)

    entrenadores_temporadas: Mapped["Entrenador"] = relationship(back_populates="temporadas_rel")
    temporada_rel: Mapped["Temporada"] = relationship(back_populates="entrenadores_temporadas")


# ── Jugadores ─────────────────────────────────────────────────────────────────

class Jugador(Base):
    __tablename__ = "jugadores"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    nombre: Mapped[str] = mapped_column(String(255))
    apellidos: Mapped[str] = mapped_column(String(255))
    nombre_conocido: Mapped[str | None] = mapped_column(String(255))
    nacionalidad: Mapped[str | None] = mapped_column(String(100))
    fecha_nacimiento: Mapped[date | None]
    ruta_foto: Mapped[str | None] = mapped_column(String(255))
    pie_dominante: Mapped[PieDominante | None] = mapped_column(Enum(PieDominante))
    altura: Mapped[int | None]
    peso: Mapped[int | None]
    localidad_nacimiento: Mapped[str | None] = mapped_column(String(255))
    pais_nacimiento: Mapped[str | None] = mapped_column(String(255), default="España")

    posiciones: Mapped[list["JugadorPosicion"]] = relationship(back_populates="jugador_rel")
    temporadas: Mapped[list["JugadorTemporada"]] = relationship(back_populates="jugador_rel")
    alineaciones: Mapped[list["Alineacion"]] = relationship(back_populates="jugador_rel")
    goles: Mapped[list["GolPartido"]] = relationship(foreign_keys="GolPartido.anotador", back_populates="anotador_rel")
    asistencias: Mapped[list["GolPartido"]] = relationship(foreign_keys="GolPartido.asistente", back_populates="asistente_rel")
    tarjetas: Mapped[list["TarjetaPartido"]] = relationship(back_populates="jugador_rel")
    penaltis_tanda: Mapped[list["PenaltiTanda"]] = relationship(back_populates="jugador_rel")


class JugadorPosicion(Base):
    __tablename__ = "jugador_posiciones"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    jugador: Mapped[int] = mapped_column(ForeignKey("jugadores.id"))
    posicion: Mapped[int] = mapped_column(ForeignKey("posiciones.id"))
    es_posicion_principal: Mapped[bool] = mapped_column(default=False)

    jugador_rel: Mapped["Jugador"] = relationship(back_populates="posiciones")
    posicion_rel: Mapped["Posicion"] = relationship(back_populates="jugadores")


class JugadorTemporada(Base):
    __tablename__ = "jugadores_temporadas"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    jugador: Mapped[int] = mapped_column(ForeignKey("jugadores.id"))
    temporada: Mapped[int] = mapped_column(ForeignKey("temporadas.id"))
    dorsal: Mapped[int | None]
    estado: Mapped[EstadoJugador] = mapped_column(Enum(EstadoJugador), default=EstadoJugador.activo)

    jugador_rel: Mapped["Jugador"] = relationship(back_populates="temporadas")
    temporada_rel: Mapped["Temporada"] = relationship(back_populates="jugadores_temporadas")


# ── Partidos y eventos ────────────────────────────────────────────────────────

class Partido(Base):
    __tablename__ = "partidos"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    equipo_local: Mapped[int] = mapped_column(ForeignKey("equipos.id"))
    equipo_visitante: Mapped[int] = mapped_column(ForeignKey("equipos.id"))
    goles_local: Mapped[int] = mapped_column(default=0)
    goles_visitante: Mapped[int] = mapped_column(default=0)
    fecha: Mapped[datetime]
    competicion_temporada: Mapped[int] = mapped_column(ForeignKey("competicion_temporada.id"))
    jornada: Mapped[int | None]
    estadio: Mapped[str | None] = mapped_column(String(255))
    estado: Mapped[EstadoPartido] = mapped_column(Enum(EstadoPartido), default=EstadoPartido.programado)
    prorroga: Mapped[bool] = mapped_column(default=False)
    entrenador_local: Mapped[int | None] = mapped_column(ForeignKey("entrenadores.id"))
    entrenador_visitante: Mapped[int | None] = mapped_column(ForeignKey("entrenadores.id"))
    penaltis_local: Mapped[int | None]
    penaltis_visitantes: Mapped[int | None]

    equipo_local_rel: Mapped["Equipo"] = relationship(foreign_keys=[equipo_local], back_populates="partidos_local")
    equipo_visitante_rel: Mapped["Equipo"] = relationship(foreign_keys=[equipo_visitante], back_populates="partidos_visitante")
    competicion_temporada_rel: Mapped["CompeticionTemporada"] = relationship(back_populates="partidos")
    entrenador_local_rel: Mapped["Entrenador | None"] = relationship(foreign_keys=[entrenador_local], back_populates="partidos_como_local")
    entrenador_visitante_rel: Mapped["Entrenador | None"] = relationship(foreign_keys=[entrenador_visitante], back_populates="partidos_como_visit")
    alineaciones: Mapped[list["Alineacion"]] = relationship(back_populates="partido_rel", cascade="all, delete-orphan", order_by="Alineacion.id")
    goles: Mapped[list["GolPartido"]] = relationship(back_populates="partido_rel", cascade="all, delete-orphan")
    tarjetas: Mapped[list["TarjetaPartido"]] = relationship(back_populates="partido_rel", cascade="all, delete-orphan")
    tanda_penaltis: Mapped[list["PenaltiTanda"]] = relationship(back_populates="partido_rel", cascade="all, delete-orphan", order_by="PenaltiTanda.orden")

class Alineacion(Base):
    __tablename__ = "alineaciones"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    jugador: Mapped[int] = mapped_column(ForeignKey("jugadores.id"))
    partido: Mapped[int] = mapped_column(ForeignKey("partidos.id"))
    titular: Mapped[bool] = mapped_column(default=False)
    minuto_entrada: Mapped[int | None]
    minuto_salida: Mapped[int | None]

    jugador_rel: Mapped["Jugador"] = relationship(back_populates="alineaciones")
    partido_rel: Mapped["Partido"] = relationship(back_populates="alineaciones")


class GolPartido(Base):
    __tablename__ = "goles_partido"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    numero_gol: Mapped[int | None]
    anotador: Mapped[int] = mapped_column(ForeignKey("jugadores.id"))
    minuto: Mapped[int]
    partido: Mapped[int] = mapped_column(ForeignKey("partidos.id"))
    tipo: Mapped[TipoGol] = mapped_column(Enum(TipoGol), default=TipoGol.normal)
    asistente: Mapped[int | None] = mapped_column(ForeignKey("jugadores.id"))
    a_favor: Mapped[bool] = mapped_column(default=True)

    anotador_rel: Mapped["Jugador"] = relationship(foreign_keys=[anotador], back_populates="goles")
    asistente_rel: Mapped["Jugador | None"] = relationship(foreign_keys=[asistente], back_populates="asistencias")
    partido_rel: Mapped["Partido"] = relationship(back_populates="goles")


class TarjetaPartido(Base):
    __tablename__ = "tarjetas_partido"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    jugador: Mapped[int] = mapped_column(ForeignKey("jugadores.id"))
    partido: Mapped[int] = mapped_column(ForeignKey("partidos.id"))
    tipo: Mapped[TipoTarjeta] = mapped_column(Enum(TipoTarjeta))
    minuto: Mapped[int]

    jugador_rel: Mapped["Jugador"] = relationship(back_populates="tarjetas")
    partido_rel: Mapped["Partido"] = relationship(back_populates="tarjetas")

class PenaltiTanda(Base):
    __tablename__ = "tandas_penaltis"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    partido: Mapped[int] = mapped_column(ForeignKey("partidos.id"))
    jugador: Mapped[int] = mapped_column(ForeignKey("jugadores.id"))
    a_favor: Mapped[bool] = mapped_column(default=True)
    anotado: Mapped[bool] = mapped_column(default=True)
    orden: Mapped[int]

    __table_args__ = (
        UniqueConstraint("partido", "orden", name="uq_partido_orden"),
    )

    partido_rel: Mapped["Partido"] = relationship(back_populates="tanda_penaltis")
    jugador_rel: Mapped["Jugador"] = relationship(back_populates="penaltis_tanda")


# ── Trofeos ───────────────────────────────────────────────────────────────────

class Trofeo(Base):
    __tablename__ = "trofeos"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    competicion_temporada: Mapped[int] = mapped_column(ForeignKey("competicion_temporada.id"))

    competicion_temporada_rel: Mapped["CompeticionTemporada"] = relationship(back_populates="trofeos")
