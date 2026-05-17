import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, X } from "lucide-react";
import { api } from "@/lib/api";
import { AdminLayout } from "@/components/admin/AdminLayout";

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({ meta: [{ title: "Dishes — Auraa Admin" }] }),
  component: () => (
    <AdminLayout>
      <Dashboard />
    </AdminLayout>
  ),
});

interface Dish {
  id: number;
  dish_name: string;
  price: number;
  category: string;
  image_url: string | null;
}

function Dashboard() {
  const [dishes, setDishes] = useState<Dish[] | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<Dish | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Dish | null>(null);
  const [uploadTarget, setUploadTarget] = useState<Dish | null>(null);

  const load = () => {
    api<Dish[]>("/admin/dishes", { auth: true })
      .then(setDishes)
      .catch((e) => toast.error(e.message));
  };

  useEffect(load, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api(`/admin/dishes/${deleteTarget.id}`, { method: "DELETE", auth: true });
      toast.success("Dish deleted");
      setDeleteTarget(null);
      load();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div className="p-6 md:p-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
            Dish Management
          </h2>
          <p className="text-muted-foreground text-sm mt-1">Manage your menu</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground font-bold rounded-lg px-4 py-2.5 hover:bg-primary-hover transition"
        >
          <Plus className="h-4 w-4" /> Add Dish
        </button>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-primary/40">
              <th className="text-left text-[11px] uppercase tracking-widest text-muted-foreground px-6 py-4">
                ID
              </th>
              <th className="text-left text-[11px] uppercase tracking-widest text-muted-foreground px-6 py-4">
                Dish Name
              </th>
              <th className="text-left text-[11px] uppercase tracking-widest text-muted-foreground px-6 py-4">
                Price
              </th>
              <th className="text-left text-[11px] uppercase tracking-widest text-muted-foreground px-6 py-4">
                Category
              </th>
              <th className="text-right text-[11px] uppercase tracking-widest text-muted-foreground px-6 py-4">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {!dishes &&
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="border-b border-border">
                  <td colSpan={5} className="px-6 py-5">
                    <div className="h-4 rounded skeleton-shimmer" />
                  </td>
                </tr>
              ))}
            {dishes && dishes.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center text-muted-foreground py-12 italic">
                  No dishes yet. Add your first dish.
                </td>
              </tr>
            )}
            {dishes?.map((d) => (
              <tr
                key={d.id}
                className="border-b border-border last:border-0 hover:bg-secondary/40 transition"
              >
                <td className="px-6 py-4 text-foreground">{d.id}</td>
                <td className="px-6 py-4 text-foreground">{d.dish_name}</td>
                <td className="px-6 py-4 text-primary font-medium">₹{d.price}</td>
                <td className="px-6 py-4 text-muted-foreground text-sm">{d.category}</td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setUploadTarget(d)}
                      className="flex items-center gap-1 border border-border text-muted-foreground text-xs rounded-md px-3 py-1.5 hover:border-primary hover:text-primary transition"
                    >
                      📷 Image
                    </button>
                    <button
                      onClick={() => setEditing(d)}
                      className="flex items-center gap-1 border border-primary text-primary text-xs rounded-md px-3 py-1.5 hover:bg-primary hover:text-primary-foreground transition"
                    >
                      <Pencil className="h-3 w-3" /> Edit
                    </button>
                    <button
                      onClick={() => setDeleteTarget(d)}
                      className="flex items-center gap-1 border border-destructive text-destructive text-xs rounded-md px-3 py-1.5 hover:bg-destructive hover:text-destructive-foreground transition"
                    >
                      <Trash2 className="h-3 w-3" /> Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <DishModal
          title="Add New Dish"
          onClose={() => setShowAdd(false)}
          onSave={async (name, price, category) => {
            await api("/admin/dishes", {
              method: "POST",
              auth: true,
              json: { dish_name: name, price, category },
            });
            toast.success("Dish added");
            setShowAdd(false);
            load();
          }}
        />
      )}

      {editing && (
        <DishModal
          title="Edit Dish"
          initialName={editing.dish_name}
          initialPrice={editing.price}
          initialCategory={editing.category}
          onClose={() => setEditing(null)}
          onSave={async (name, price, category) => {
            await api(`/admin/dishes/${editing.id}`, {
              method: "PATCH",
              auth: true,
              json: { dish_name: name, price, category },
            });
            toast.success("Dish updated");
            setEditing(null);
            load();
          }}
        />
      )}
      {uploadTarget && (
        <Modal onClose={() => setUploadTarget(null)}>
          <h3 className="font-display text-xl font-bold text-primary mb-5">
            Upload Image — {uploadTarget.dish_name}
          </h3>
          {uploadTarget.image_url && (
            <img
              src={`http://localhost:8000${uploadTarget.image_url}`}
              alt={uploadTarget.dish_name}
              className="w-full h-40 object-cover rounded-lg mb-4"
            />
          )}
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-primary/40 rounded-lg cursor-pointer hover:border-primary transition mb-4 bg-input">
            <span className="text-muted-foreground text-sm">📷 Click to choose image</span>
            <span className="text-muted-foreground text-xs mt-1">JPG, PNG supported</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const formData = new FormData();
              formData.append("file", file);
              try {
                const token = localStorage.getItem("auraa_token");
                const res = await fetch(
                  `http://localhost:8000/admin/dishes/${uploadTarget.id}/image`,
                  {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` },
                    body: formData,
                  },
                );
                if (!res.ok) throw new Error("Upload failed");
                toast.success("Image uploaded");
                setUploadTarget(null);
                load();
              } catch {
                toast.error("Failed to upload image");
              }
            }}
            />
          </label>
          <button
            onClick={() => setUploadTarget(null)}
            className="w-full px-4 py-2 text-sm text-muted-foreground hover:text-foreground border border-border rounded-lg"
          >
            Cancel
          </button>
        </Modal>
      )}
      {deleteTarget && (
        <Modal onClose={() => setDeleteTarget(null)}>
          <h3 className="text-lg font-bold text-foreground mb-2">Delete dish?</h3>
          <p className="text-muted-foreground text-sm mb-6">
            Are you sure you want to delete{" "}
            <span className="text-primary">{deleteTarget.dish_name}</span>?
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setDeleteTarget(null)}
              className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 text-sm bg-destructive text-destructive-foreground rounded-lg font-bold hover:opacity-90"
            >
              Delete
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative w-full max-w-md bg-card border border-primary rounded-xl p-6 gold-glow">
        <button onClick={onClose} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground" aria-label="Close">
          <X className="h-4 w-4" />
        </button>
        {children}
      </div>
    </div>
  );
}

function DishModal({
  title,
  initialName = "",
  initialPrice = 0,
  initialCategory = "Main Course",
  onClose,
  onSave,
}: {
  title: string;
  initialName?: string;
  initialPrice?: number;
  initialCategory?: string;
  onClose: () => void;
  onSave: (name: string, price: number, category: string) => Promise<void>;
}) {
  const [name, setName] = useState(initialName);
  const [price, setPrice] = useState<string>(String(initialPrice));
  const [saving, setSaving] = useState(false);
  const [category, setCategory] = useState(initialCategory);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const p = Number(price);
    if (!name.trim()) return toast.error("Name required");
    if (Number.isNaN(p) || p < 0) return toast.error("Valid price required");
    setSaving(true);
    try {
      await onSave(name.trim(), p, category);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal onClose={onClose}>
      <h3 className="font-display text-xl font-bold text-primary mb-5">{title}</h3>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-[11px] uppercase tracking-widest text-muted-foreground mb-2">
            Dish Name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-input border border-border focus:border-primary outline-none rounded-lg px-3 py-2.5 text-foreground"
            required
          />
        </div>
        <div>
          <label className="block text-[11px] uppercase tracking-widest text-muted-foreground mb-2">
            Price (₹)
          </label>
          <input
            type="number"
            min={0}
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full bg-input border border-border focus:border-primary outline-none rounded-lg px-3 py-2.5 text-foreground"
            required
          />
        </div>
        <div>
          <label className="block text-[11px] uppercase tracking-widest text-muted-foreground mb-2">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-input border border-border focus:border-primary outline-none rounded-lg px-3 py-2.5 text-foreground"
          >
            <option value="Starters">Starters</option>
            <option value="Main Course">Main Course</option>
            <option value="Desserts">Desserts</option>
            <option value="Drinks">Drinks</option>
            <option value="Specials">Specials</option>
          </select>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 text-sm bg-primary text-primary-foreground rounded-lg font-bold hover:bg-primary-hover disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
