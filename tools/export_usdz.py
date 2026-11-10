"""Export animated iPhone AR copies from the web GLBs without modifying them."""
from pathlib import Path
import sys
import bpy

SITE = Path(__file__).resolve().parents[1]
SOURCE = SITE / "assets" / "models"
DESTINATION = SITE / "assets" / "models-ios"


def clear_scene():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for collection in (bpy.data.actions, bpy.data.materials, bpy.data.meshes,
                       bpy.data.images, bpy.data.armatures):
        for item in list(collection):
            collection.remove(item)


def export_model(name):
    source = SOURCE / f"{name}.glb"
    target = DESTINATION / f"{name}.usdz"
    if not source.exists():
        raise FileNotFoundError(source)
    clear_scene()
    bpy.ops.import_scene.gltf(filepath=str(source))
    bpy.ops.wm.usd_export(
        filepath=str(target),
        export_animation=True,
        export_armatures=True,
        export_materials=True,
        export_meshes=True,
        export_normals=True,
        export_uvmaps=True,
        export_textures_mode="NEW",
        convert_orientation=True,
        relative_paths=False,
    )
    if not target.exists() or target.stat().st_size == 0:
        raise RuntimeError(f"USDZ was not created: {target}")
    print(f"EXPORTED {target.name} {target.stat().st_size}")


def main():
    names = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    if not names:
        names = [path.stem for path in sorted(SOURCE.glob("*.glb"))]
    DESTINATION.mkdir(parents=True, exist_ok=True)
    for name in names:
        export_model(name)


main()
