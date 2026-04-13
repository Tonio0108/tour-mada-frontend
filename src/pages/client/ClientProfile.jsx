import React, { useState, useEffect } from "react";
import { 
  User, Mail, Phone, MapPin, Edit, Save, X, Calendar, Shield, Globe, Loader, Lock, Menu, ChevronDown
} from "lucide-react";
import { getAuthToken } from "../../../lib/api";
import { useTranslation, Trans } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export default function Profile() {
  const { t } = useTranslation();
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [passwordData, setPasswordData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [changingPassword, setChangingPassword] = useState(false);
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  const url = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    const token = await getAuthToken();
    try {
      setLoading(true);
      const response = await fetch(`${url}/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setUserData(data);
      setEditedData({
        nom: data.Clients?.nom || "", prenom: data.Clients?.prenom || "",
        telephone: data.Clients?.telephone || "", adresse: data.Clients?.adresse || "",
        ville: data.Clients?.ville || "", codepostal: data.Clients?.codepostal || "",
        pays: data.Clients?.pays || "", email: data.email || ""
      });
    } catch (error) { toast.error(t('profile.messages.update_error')); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    const token = await getAuthToken();
    setSaving(true);
    try {
      const clientData = {
        nom: editedData.nom, prenom: editedData.prenom, telephone: editedData.telephone,
        adresse: editedData.adresse, ville: editedData.ville, codepostal: editedData.codepostal, pays: editedData.pays
      };
      await fetch(`${url}/client/${userData.Clients.id_client}`, {
        method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(clientData)
      });
      if (editedData.email !== userData.email) {
        await fetch(`${url}/user/${userData.id_utilisateur}`, {
          method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ email: editedData.email })
        });
      }
      await fetchUserProfile();
      toast.success(t('profile.messages.profile_updated'));
      setIsEditing(false);
    } catch (error) { toast.error(t('profile.messages.update_error')); }
    finally { setSaving(false); }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error(t('profile.password_modal.password_mismatch')); return;
    }
    setChangingPassword(true);
    const token = await getAuthToken();
    try {
      const response = await fetch(`${url}/client/me/password`, {
        method: "PUT", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: passwordData.currentPassword, newPassword: passwordData.newPassword }),
      });
      if (!response.ok) throw new Error();
      toast.success(t('profile.messages.password_changed'));
      setPasswordModalVisible(false);
    } catch (error) { toast.error(t('profile.messages.password_error')); }
    finally { setChangingPassword(false); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader className="animate-spin text-emerald-600" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{t('profile.title')}</h1>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setPasswordModalVisible(true)} size="sm"><Lock className="w-4 h-4 mr-2" /> {t('profile.buttons.change_password')}</Button>
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)} size="sm" className="bg-emerald-600 hover:bg-emerald-700"><Edit className="w-4 h-4 mr-2" /> {t('profile.buttons.edit')}</Button>
              ) : (
                <>
                  <Button variant="ghost" onClick={() => setIsEditing(false)} size="sm">{t('profile.buttons.cancel')}</Button>
                  <Button onClick={handleSave} size="sm" disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">{saving ? <Loader className="animate-spin w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />} {t('profile.buttons.save')}</Button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <div className="mx-auto w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center mb-4"><User className="h-12 w-12 text-emerald-600" /></div>
              <h2 className="font-semibold text-lg">{userData?.Clients?.prenom} {userData?.Clients?.nom}</h2>
              <p className="text-gray-600 text-sm">{userData?.email}</p>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
              <h3 className="text-lg font-semibold">{t('profile.personal_info.title')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label={t('profile.personal_info.first_name')} value={editedData.prenom} disabled={!isEditing} onChange={(e) => setEditedData({...editedData, prenom: e.target.value})} />
                <Input label={t('profile.personal_info.last_name')} value={editedData.nom} disabled={!isEditing} onChange={(e) => setEditedData({...editedData, nom: e.target.value})} />
                <Input label={t('profile.personal_info.email')} value={editedData.email} disabled={!isEditing} onChange={(e) => setEditedData({...editedData, email: e.target.value})} />
                <Input label={t('profile.personal_info.phone')} value={editedData.telephone} disabled={!isEditing} onChange={(e) => setEditedData({...editedData, telephone: e.target.value})} />
                <div className="md:col-span-2"><Input label={t('profile.personal_info.address')} value={editedData.adresse} disabled={!isEditing} onChange={(e) => setEditedData({...editedData, adresse: e.target.value})} /></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={passwordModalVisible} onOpenChange={setPasswordModalVisible}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{t('profile.password_modal.title')}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <Input label={t('profile.password_modal.current_password')} type="password" value={passwordData.currentPassword} onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})} showPasswordToggle />
            <Input label={t('profile.password_modal.new_password')} type="password" value={passwordData.newPassword} onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})} showPasswordToggle />
            <Input label={t('profile.password_modal.confirm_password')} type="password" value={passwordData.confirmPassword} onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})} showPasswordToggle />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setPasswordModalVisible(false)}>{t('profile.buttons.cancel')}</Button>
            <Button onClick={handleChangePassword} disabled={changingPassword} className="bg-emerald-600 hover:bg-emerald-700">{changingPassword ? <Loader className="animate-spin w-4 h-4" /> : t('profile.buttons.change_password_submit')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
