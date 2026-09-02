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

import enum
from datetime import date, datetime

from sqlalchemy import (
    Boolean, Column, Date, DateTime, Enum, ForeignKey,
    Integer, String, UniqueConstraint,
)
from sqlalchemy.orm import relationship

from app.db.session import Base

# ── Enums ────────────────────────────────────────────────────────────────────

class TipoCompeticion(str, enum.Enum):
    liga = "liga"
    copa = "copa"
    fase = "fase"
    amistoso = "amistoso"


class EstadoPartido(str, enum.Enum):
    jugado = "jugado"
    aplazado = "aplazado"
    suspendido = "suspendido"
    programado = "programado"


class TipoGol(str, enum.Enum):
    normal = "normal"
    penalti = "penalti"
    falta_directa = "falta_directa"
    propia_puerta = "propia_puerta"


class TipoTarjeta(str, enum.Enum):
    amarilla = "amarilla"
    roja = "roja"
    doble_amarilla = "doble_amarilla"


class PieDominante(str, enum.Enum):
    zurdo = "zurdo"
    diestro = "diestro"
    ambidiestro = "ambidiestro"


class RolPosicion(str, enum.Enum):
    portero = "portero"
    defensa = "defensa"
    centro_del_campo = "centro del campo"
    ataque = "ataque"


class EstadoJugador(str, enum.Enum):
    activo = "activo"
    cedido = "cedido"
    lesionado = "lesionado"
    baja = "baja"


class TipoEntrenador(str, enum.Enum):
    principal = "principal"
    segundo = "segundo"
    otros = "otros"


# ── Tablas independientes ─────────────────────────────────────────────────────

class Temporada(Base):
    __tablename__ = "temporadas"

    id           = Column(Integer, primary_key=True, autoincrement=True)
    nombre       = Column(String(255), nullable=False)
    fecha_inicio = Column(Date, nullable=False)
    fecha_fin    = Column(Date, nullable=False)

    competiciones_temporada = relationship("CompeticionTemporada", back_populates="temporada_rel")
    jugadores_temporadas    = relationship("JugadorTemporada",     back_populates="temporada_rel")
    entrenadores_temporadas = relationship("EntrenadorTemporada",  back_populates="temporada_rel")


class Competicion(Base):
    __tablename__ = "competiciones"

    id      = Column(Integer, primary_key=True, autoincrement=True)
    nombre  = Column(String(255), nullable=False)
    pais    = Column(String(100), nullable=False)
    tipo    = Column(Enum(TipoCompeticion), nullable=False)
    oficial = Column(Boolean, nullable=False, default=False)

    ediciones = relationship("CompeticionTemporada", back_populates="competicion_rel")


class CompeticionTemporada(Base):
    __tablename__ = "competicion_temporada"

    id           = Column(Integer, primary_key=True, autoincrement=True)
    competicion  = Column(Integer, ForeignKey("competiciones.id"), nullable=False)
    temporada    = Column(Integer, ForeignKey("temporadas.id"),    nullable=False)
    num_jornadas = Column(Integer)
    num_equipos  = Column(Integer)
    grupo        = Column(Integer)
    ascenso      = Column(Boolean, default=None)
    descenso     = Column(Boolean, default=None)

    competicion_rel = relationship("Competicion", back_populates="ediciones")
    temporada_rel   = relationship("Temporada",   back_populates="competiciones_temporada")
    partidos        = relationship("Partido",     back_populates="competicion_temporada_rel")
    trofeos         = relationship("Trofeo",      back_populates="competicion_temporada_rel")


class Equipo(Base):
    __tablename__ = "equipos"

    id               = Column(Integer, primary_key=True, autoincrement=True)
    nombre           = Column(String(255), nullable=False)
    abreviacion      = Column(String(4), nullable=False)
    nombre_corto     = Column(String(100))
    ruta_escudo      = Column(String(255))
    localidad        = Column(String(255))
    pais             = Column(String(100))
    equipo_principal = Column(Boolean, nullable=False, default=False)
    estadio          = Column(String(255))

    partidos_local     = relationship("Partido", foreign_keys="Partido.equipo_local",     back_populates="equipo_local_rel")
    partidos_visitante = relationship("Partido", foreign_keys="Partido.equipo_visitante", back_populates="equipo_visitante_rel")


class Posicion(Base):
    __tablename__ = "posiciones"

    id          = Column(Integer, primary_key=True, autoincrement=True)
    nombre      = Column(String(100), nullable=False)
    abreviacion = Column(String(4),   nullable=False)
    rol         = Column(Enum(RolPosicion, values_callable=lambda x: [e.value for e in x]), nullable=False)

    jugadores = relationship("JugadorPosicion", back_populates="posicion_rel")


# ── Entrenadores ──────────────────────────────────────────────────────────────

class Entrenador(Base):
    __tablename__ = "entrenadores"

    id               = Column(Integer, primary_key=True, autoincrement=True)
    nombre           = Column(String(255), nullable=False)
    apellidos        = Column(String(255), nullable=False)
    nombre_conocido  = Column(String(200))
    nacionalidad     = Column(String(100))
    fecha_nacimiento = Column(Date)
    ruta_foto        = Column(String(255))
    localidad_nacimiento = Column(String(255))

    temporadas_rel       = relationship("EntrenadorTemporada", back_populates="entrenadores_temporadas")
    partidos_como_local  = relationship("Partido", foreign_keys="Partido.entrenador_local",     back_populates="entrenador_local_rel")
    partidos_como_visit  = relationship("Partido", foreign_keys="Partido.entrenador_visitante", back_populates="entrenador_visitante_rel")


class EntrenadorTemporada(Base):
    __tablename__ = "entrenadores_temporadas"

    id                          = Column(Integer, primary_key=True, autoincrement=True)
    entrenador                  = Column(Integer, ForeignKey("entrenadores.id"), nullable=False)
    temporada                   = Column(Integer, ForeignKey("temporadas.id"),   nullable=False)
    tipo                        = Column(Enum(TipoEntrenador), nullable=False, default=TipoEntrenador.principal)
    entrenador_equipo_principal = Column(Boolean, nullable=False, default=False)

    entrenadores_temporadas = relationship("Entrenador", back_populates="temporadas_rel")
    temporada_rel  = relationship("Temporada",  back_populates="entrenadores_temporadas")


# ── Jugadores ─────────────────────────────────────────────────────────────────

class Jugador(Base):
    __tablename__ = "jugadores"

    id               = Column(Integer, primary_key=True, autoincrement=True)
    nombre           = Column(String(255), nullable=False)
    apellidos        = Column(String(255), nullable=False)
    nombre_conocido  = Column(String(255))
    nacionalidad     = Column(String(100))
    fecha_nacimiento = Column(Date)
    ruta_foto        = Column(String(255))
    pie_dominante    = Column(Enum(PieDominante))
    altura           = Column(Integer)
    peso             = Column(Integer)
    localidad_nacimiento = Column(String(255))
    pais_nacimiento  = Column(String(255))

    posiciones   = relationship("JugadorPosicion",  back_populates="jugador_rel")
    temporadas   = relationship("JugadorTemporada", back_populates="jugador_rel")
    alineaciones = relationship("Alineacion",       back_populates="jugador_rel")
    goles        = relationship("GolPartido",        foreign_keys="GolPartido.anotador", back_populates="anotador_rel")
    asistencias  = relationship("GolPartido",        foreign_keys="GolPartido.asistente", back_populates="asistente_rel")
    tarjetas     = relationship("TarjetaPartido",    back_populates="jugador_rel")
    penaltis_tanda = relationship("PenaltiTanda", back_populates="jugador_rel")


class JugadorPosicion(Base):
    __tablename__ = "jugador_posiciones"

    id                    = Column(Integer, primary_key=True, autoincrement=True)
    jugador               = Column(Integer, ForeignKey("jugadores.id"),  nullable=False)
    posicion              = Column(Integer, ForeignKey("posiciones.id"), nullable=False)
    es_posicion_principal = Column(Boolean, nullable=False, default=False)

    jugador_rel  = relationship("Jugador",  back_populates="posiciones")
    posicion_rel = relationship("Posicion", back_populates="jugadores")


class JugadorTemporada(Base):
    __tablename__ = "jugadores_temporadas"

    id        = Column(Integer, primary_key=True, autoincrement=True)
    jugador   = Column(Integer, ForeignKey("jugadores.id"),  nullable=False)
    temporada = Column(Integer, ForeignKey("temporadas.id"), nullable=False)
    dorsal    = Column(Integer)
    estado    = Column(Enum(EstadoJugador), nullable=False, default=EstadoJugador.activo)

    jugador_rel   = relationship("Jugador",   back_populates="temporadas")
    temporada_rel = relationship("Temporada", back_populates="jugadores_temporadas")


# ── Partidos y eventos ────────────────────────────────────────────────────────

class Partido(Base):
    __tablename__ = "partidos"

    id                    = Column(Integer, primary_key=True, autoincrement=True)
    equipo_local          = Column(Integer, ForeignKey("equipos.id"),               nullable=False)
    equipo_visitante      = Column(Integer, ForeignKey("equipos.id"),               nullable=False)
    goles_local           = Column(Integer, nullable=False, default=0)
    goles_visitante       = Column(Integer, nullable=False, default=0)
    fecha                 = Column(DateTime, nullable=False)
    competicion_temporada = Column(Integer, ForeignKey("competicion_temporada.id"), nullable=False)
    jornada               = Column(Integer)
    estadio               = Column(String(255))
    estado                = Column(Enum(EstadoPartido), nullable=False, default=EstadoPartido.programado)
    prorroga              = Column(Boolean, nullable=False, default=False)
    entrenador_local      = Column(Integer, ForeignKey("entrenadores.id"))
    entrenador_visitante  = Column(Integer, ForeignKey("entrenadores.id"))
    penaltis_local        = Column(Integer)
    penaltis_visitantes   = Column(Integer)

    equipo_local_rel          = relationship("Equipo",              foreign_keys=[equipo_local],          back_populates="partidos_local")
    equipo_visitante_rel      = relationship("Equipo",              foreign_keys=[equipo_visitante],      back_populates="partidos_visitante")
    competicion_temporada_rel = relationship("CompeticionTemporada",                                      back_populates="partidos")
    entrenador_local_rel      = relationship("Entrenador",          foreign_keys=[entrenador_local],      back_populates="partidos_como_local")
    entrenador_visitante_rel  = relationship("Entrenador",          foreign_keys=[entrenador_visitante],  back_populates="partidos_como_visit")
    alineaciones              = relationship("Alineacion",                                                back_populates="partido_rel",   cascade="all, delete-orphan", order_by="Alineacion.id")
    goles                     = relationship("GolPartido",                                                back_populates="partido_rel",   cascade="all, delete-orphan")
    tarjetas                  = relationship("TarjetaPartido",                                            back_populates="partido_rel",   cascade="all, delete-orphan")
    tanda_penaltis            = relationship("PenaltiTanda", back_populates="partido_rel", cascade="all, delete-orphan", order_by="PenaltiTanda.orden")

class Alineacion(Base):
    __tablename__ = "alineaciones"

    id             = Column(Integer, primary_key=True, autoincrement=True)
    jugador        = Column(Integer, ForeignKey("jugadores.id"), nullable=False)
    partido        = Column(Integer, ForeignKey("partidos.id"),  nullable=False)
    titular        = Column(Boolean, nullable=False, default=False)
    minuto_entrada = Column(Integer)
    minuto_salida  = Column(Integer)

    jugador_rel = relationship("Jugador", back_populates="alineaciones")
    partido_rel = relationship("Partido", back_populates="alineaciones")


class GolPartido(Base):
    __tablename__ = "goles_partido"

    id         = Column(Integer, primary_key=True, autoincrement=True)
    numero_gol = Column(Integer)
    anotador   = Column(Integer, ForeignKey("jugadores.id"), nullable=False)
    minuto     = Column(Integer, nullable=False)
    partido    = Column(Integer, ForeignKey("partidos.id"),  nullable=False)
    tipo       = Column(Enum(TipoGol), nullable=False, default=TipoGol.normal)
    asistente  = Column(Integer, ForeignKey("jugadores.id"))
    a_favor    = Column(Boolean, nullable=False, default=True)

    anotador_rel  = relationship("Jugador", foreign_keys=[anotador],  back_populates="goles")
    asistente_rel = relationship("Jugador", foreign_keys=[asistente], back_populates="asistencias")
    partido_rel   = relationship("Partido", back_populates="goles")


class TarjetaPartido(Base):
    __tablename__ = "tarjetas_partido"

    id      = Column(Integer, primary_key=True, autoincrement=True)
    jugador = Column(Integer, ForeignKey("jugadores.id"), nullable=False)
    partido = Column(Integer, ForeignKey("partidos.id"),  nullable=False)
    tipo    = Column(Enum(TipoTarjeta), nullable=False)
    minuto  = Column(Integer, nullable=False)

    jugador_rel = relationship("Jugador", back_populates="tarjetas")
    partido_rel = relationship("Partido", back_populates="tarjetas")

class PenaltiTanda(Base):
    __tablename__ = "tandas_penaltis"

    id      = Column(Integer, primary_key=True, autoincrement=True)
    partido = Column(Integer, ForeignKey("partidos.id"),  nullable=False)
    jugador = Column(Integer, ForeignKey("jugadores.id"), nullable=False)
    a_favor = Column(Boolean, nullable=False, default=True)
    anotado = Column(Boolean, nullable=False, default=True)
    orden   = Column(Integer, nullable=False)

    __table_args__ = (
        UniqueConstraint("partido", "orden", name="uq_partido_orden"),
    )

    partido_rel = relationship("Partido", back_populates="tanda_penaltis")
    jugador_rel = relationship("Jugador", back_populates="penaltis_tanda")


# ── Trofeos ───────────────────────────────────────────────────────────────────

class Trofeo(Base):
    __tablename__ = "trofeos"

    id                    = Column(Integer, primary_key=True, autoincrement=True)
    competicion_temporada = Column(Integer, ForeignKey("competicion_temporada.id"), nullable=False)

    competicion_temporada_rel = relationship("CompeticionTemporada", back_populates="trofeos")