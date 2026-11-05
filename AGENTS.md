# Guía de Estilo, Branding y Sistema de Diseño (Six Tenet)

Para este proyecto es **estricto y obligatorio** mantener un estándar SaaS profesional, pulcro y premium. No se deben improvisar paletas de colores ni saturar interfaces con elementos visuales innecesarios.

---

## 1. Reglas Estrictas de Color y Branding

### A. Paleta Oficial de Branding
- **Color Principal de Acento / Branding:** `#89c900` (verde institucional Six Tenet).
- **Color Secundario / Highlight:** `#d8e454` (acento lima).
- **Fondos Oscuros (Dark Mode):** Base sólida `#181818`, cards `#222222`, bordes `#333333`, divisores y subfondos `#2a2a2a` / `#161616`.
- **Fondos Claros (Light Mode):** `#fafafd` con texturas orgánicas suaves y cards blancas (`bg-white/95`) con bordes sutiles.
- **Tipografía:** `Plus Jakarta Sans` (`font-pagani` / sans estándar). Se prohíbe el uso de fuentes monoespaciadas (`font-mono`) para badges o UI de usuario general; reservar monospace exclusivamente para identificadores técnicos o código si aplica.

### B. Uso de Colores Semánticos (Estrictamente Justificados)
Fuera de la paleta del tema (grises, blancos, negros y acento verde de Six Tenet), **solamente** se permiten colores semánticos en escenarios funcionales claros:
1. **Azul:** Exclusivo para estados informativos del sistema o elementos activos/seleccionados de selección primaria (e.g. `focus:border-blue-500`, fila seleccionada).
2. **Ámbar / Amarillo:** Exclusivo para advertencias de riesgo o estados transitorios de escaneo (`Scanning...`).
3. **Rojo:** Exclusivo para errores destructivos, badges requeridos (`Required`) o confirmaciones de borrado/fallo.
4. **Verde:** Exclusivo para éxito confirmado o estados de conexión online.

### C. Prohibición de Iconos Multicolor
- **Queda terminantemente prohibido colorear iconos con arcoíris de colores** (e.g. pintar un icono azul, otro verde, otro ámbar solo para adornar campos de un formulario).
- Los iconos de soporte en inputs y labels deben ser **monocromáticos**, sobrios y elegantes, usando la paleta neutra (`text-gray-400` / `text-[#888888]`) o el acento de marca cuando esté activo.

---

## 2. Principios de UX / UI para Modales y Pantallas Complejas

1. **Jerarquía Visual y Espaciado:**
   - Evitar saturación de controles en cajas comprimidas.
   - Usar contenedores con padding adecuado, bordes limpios y fondos con contraste suave.
2. **Consistencia:**
   - Todo modal debe lucir integrado con el resto de la suite Six Tenet (Enterprise SaaS).
   - Tipografía equilibrada, labels concisos y botones primarios con estados hover/disabled bien definidos.
