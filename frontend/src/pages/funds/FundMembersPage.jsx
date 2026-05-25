import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { PageHeader } from "../../components/common/PageHeader.jsx";
import { useActiveCompany } from "../../context/ActiveCompanyContext.jsx";
import { getFundMembers, saveFundMember, updateFundMemberStatus } from "../../services/fund.service.js";
import { queryClient } from "../../services/queryClient.js";
import { getApiErrorMessage } from "../../utils/api.js";
import { currency } from "../../utils/format.js";

const emptyMember = {
  full_name: "",
  document_number: "",
  phone: "",
  email: "",
  address: "",
  status: "active",
  notes: ""
};

export function FundMembersPage() {
  const { activeCompany } = useActiveCompany();
  const [form, setForm] = useState(emptyMember);
  const [editing, setEditing] = useState(null);

  const membersQuery = useQuery({
    queryKey: ["fund-members", activeCompany?.id],
    queryFn: () => getFundMembers(activeCompany?.id)
  });

  useEffect(() => {
    if (!editing) return;
    setForm({
      full_name: editing.full_name || "",
      document_number: editing.document_number || "",
      phone: editing.phone || "",
      email: editing.email || "",
      address: editing.address || "",
      status: editing.status || "active",
      notes: editing.notes || ""
    });
  }, [editing]);

  const mutation = useMutation({
    mutationFn: (payload) => saveFundMember(payload, editing?.id),
    onSuccess: async () => {
      toast.success(editing ? "Miembro actualizado" : "Miembro creado");
      setEditing(null);
      setForm(emptyMember);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["fund-members"] }),
        queryClient.invalidateQueries({ queryKey: ["fund-overview"] })
      ]);
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "No fue posible guardar el miembro"))
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => updateFundMemberStatus(id, { company_id: activeCompany?.id, status }),
    onSuccess: async () => {
      toast.success("Estado actualizado");
      await queryClient.invalidateQueries({ queryKey: ["fund-members"] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "No fue posible actualizar el estado"))
  });

  function submit(event) {
    event.preventDefault();
    mutation.mutate({ ...form, company_id: activeCompany?.id });
  }

  function cancelEdit() {
    setEditing(null);
    setForm(emptyMember);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Fondo solidario"
        title="Miembros del fondo"
        description="Crea, edita, activa e inactiva los miembros del fondo sin tocar participantes del modelo standard."
      />

      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <form className="panel-soft p-6" onSubmit={submit}>
          <h3 className="text-lg font-semibold text-slate-950">{editing ? "Editar miembro" : "Nuevo miembro"}</h3>
          <div className="mt-5 grid gap-4">
            <input className="input-light" value={form.full_name} onChange={(event) => setForm({ ...form, full_name: event.target.value })} placeholder="Nombre completo" required />
            <input className="input-light" value={form.document_number} onChange={(event) => setForm({ ...form, document_number: event.target.value })} placeholder="Documento" required />
            <input className="input-light" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="Telefono" />
            <input className="input-light" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="Correo" />
            <input className="input-light" value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} placeholder="Direccion" />
            <select className="input-light" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
            </select>
            <textarea className="input-light" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} placeholder="Notas" rows="3" />
          </div>
          <div className="mt-5 flex gap-3">
            <button className="btn-primary" type="submit" disabled={mutation.isPending}>{editing ? "Guardar cambios" : "Crear miembro"}</button>
            {editing ? <button className="btn-secondary" type="button" onClick={cancelEdit}>Cancelar</button> : null}
          </div>
        </form>

        <section className="panel-soft p-6">
          <h3 className="text-lg font-semibold text-slate-950">Miembros registrados</h3>
          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-100">
            <table className="min-w-full divide-y divide-slate-100 text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.16em] text-slate-500">
                <tr>
                  <th className="px-4 py-3">Miembro</th>
                  <th className="px-4 py-3">Cupos</th>
                  <th className="px-4 py-3">Mensual</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {(membersQuery.data ?? []).map((member) => (
                  <tr key={member.id}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-950">{member.full_name}</p>
                      <p className="text-xs text-slate-500">{member.document_number} | {member.phone || "Sin telefono"}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{Number(member.quota_count ?? 0)}</td>
                    <td className="px-4 py-3 text-slate-600">{currency(member.monthly_payment ?? 0)}</td>
                    <td className="px-4 py-3"><span className={member.status === "active" ? "status-badge status-ok" : "status-badge"}>{member.status}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button className="btn-secondary" type="button" onClick={() => setEditing(member)}>Editar</button>
                        <button
                          className="btn-secondary"
                          type="button"
                          onClick={() => statusMutation.mutate({ id: member.id, status: member.status === "active" ? "inactive" : "active" })}
                        >
                          {member.status === "active" ? "Inactivar" : "Activar"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!membersQuery.isLoading && (membersQuery.data ?? []).length === 0 ? (
                  <tr><td className="px-4 py-6 text-center text-slate-500" colSpan="5">Aun no hay miembros registrados.</td></tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

export default FundMembersPage;
