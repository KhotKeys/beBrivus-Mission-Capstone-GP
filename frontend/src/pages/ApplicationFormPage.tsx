import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { api } from '../api';
import { Layout } from '../components/layout';
import { ArrowLeft, Upload, FileText, Send, User, Mail, Phone, MapPin } from 'lucide-react';

interface Opportunity {
  id: number;
  title: string;
  organization: string;
  description: string;
  requirements: string;
  application_process: string;
}

export const ApplicationFormPage: React.FC = () => {
  const { opportunityId } = useParams<{ opportunityId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    location: '',
    age: '',
    university: '',
    course: '',
    year_of_study: '',
    country: '',
    why_chosen: '',
    career_goals: '',
    cover_letter: '',
  });
  const [resume, setResume] = useState<File | null>(null);

  const { data: opportunity, isLoading } = useQuery<Opportunity>({
    queryKey: ['opportunity', opportunityId],
    queryFn: async () => {
      const res = await api.get(`/opportunities/${opportunityId}/`);
      return res.data;
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await api.post(`/opportunities/${opportunityId}/apply/`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    },
    onSuccess: () => {
      alert('Application submitted successfully! The institution will review your application.');
      navigate('/tracker');
    },
    onError: (error: any) => {
      const errorMsg = error?.response?.data?.error || 'Failed to submit application. Please try again.';
      alert(errorMsg);
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.full_name || !formData.email || !formData.cover_letter) {
      alert('Please fill in all required fields');
      return;
    }

    const data = new FormData();
    // Original fields
    data.append('full_name', formData.full_name);
    data.append('email', formData.email);
    data.append('phone', formData.phone);
    data.append('location', formData.location);
    data.append('cover_letter', formData.cover_letter);
    if (resume) {
      data.append('resume', resume);
    }
    
    // New fields — append ALL of them
    if (formData.age) data.append('age', formData.age);
    if (formData.university) data.append('university', formData.university);
    if (formData.course) data.append('course', formData.course);
    if (formData.year_of_study) data.append('year_of_study', formData.year_of_study);
    if (formData.country) data.append('country_of_residence', formData.country);
    if (formData.why_chosen) data.append('why_chosen', formData.why_chosen);
    if (formData.career_goals) data.append('career_goals', formData.career_goals);

    submitMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">Loading...</div>
        </div>
      </Layout>
    );
  }

  if (!opportunity) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <p className="text-red-600">Opportunity not found</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{
        width: '100%',
        maxWidth: '100%',
        overflowX: 'hidden',
        boxSizing: 'border-box',
        padding: 'clamp(16px, 4vw, 32px)',
      }}>
        <button
          onClick={() => navigate('/opportunities')}
          className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Opportunities
        </button>

        <div style={{
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box',
          overflow: 'hidden',
          padding: '16px',
          borderRadius: '12px',
        }} className="bg-white rounded-2xl shadow-sm border border-neutral-100 mb-6">
          <h2 style={{
            fontSize: 'clamp(14px, 3.5vw, 20px)',
            overflowWrap: 'break-word',
            wordBreak: 'break-word',
            whiteSpace: 'normal',
            maxWidth: '100%',
            lineHeight: '1.3',
            margin: '0 0 8px 0',
            fontWeight: 'bold',
            color: '#171717',
          }}>{t('Applying for')} {opportunity.title}</h2>
          <p className="text-neutral-600" style={{ overflowWrap: 'break-word', wordBreak: 'break-word', maxWidth: '100%' }}>{opportunity.organization}</p>
        </div>

        {opportunity.application_process && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <div className="flex items-start gap-3">
              <FileText className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">{t('Application Process')}</h3>
                <p className="text-sm text-blue-800 leading-relaxed">{opportunity.application_process}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">{t('Personal Information')}</h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  <User className="w-4 h-4 inline mr-1" />
                  {t('Full Name')} *
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="John Doe"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-1" />
                  {t('Email')} *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="john@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  <Phone className="w-4 h-4 inline mr-1" />
                  {t('Phone Number')}
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="+1 234 567 8900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  {t('Location')}
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="City, Country"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  {t('Age')} *
                </label>
                <input
                  type="number"
                  name="age"
                  min="16"
                  max="45"
                  value={formData.age}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder={t('Enter your age')}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  {t('University or Institution')} *
                </label>
                <input
                  type="text"
                  name="university"
                  value={formData.university}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder={t('Enter your university or institution name')}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  {t('Course or Field of Study')} *
                </label>
                <input
                  type="text"
                  name="course"
                  value={formData.course}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g. Computer Science, Medicine, Law"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  {t('Year of Study')} *
                </label>
                <select
                  name="year_of_study"
                  value={formData.year_of_study}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                >
                  <option value="">{t('Select year of study')}</option>
                  <option value="1">{t('Year 1')}</option>
                  <option value="2">{t('Year 2')}</option>
                  <option value="3">{t('Year 3')}</option>
                  <option value="4">{t('Year 4')}</option>
                  <option value="5">{t('Year 5+')}</option>
                  <option value="postgraduate">{t('Postgraduate')}</option>
                  <option value="phd">{t('PhD')}</option>
                  <option value="undergraduate">{t('Undergraduate')}</option>
                  <option value="talented">{t('Talented')}</option>
                  <option value="professional">{t('Professional')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  {t('Country of Residence')} *
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder={t('Enter your country of residence')}
                  required
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                {t('Why have you chosen this opportunity?')} *
              </label>
              <textarea
                name="why_chosen"
                value={formData.why_chosen}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder={t('Explain why this specific opportunity aligns with your goals and aspirations (minimum 100 words)')}
                required
                style={{ width: '100%', resize: 'vertical' }}
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                {t('Career Goals and Aspirations')} *
              </label>
              <textarea
                name="career_goals"
                value={formData.career_goals}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder={t('Describe your short and long-term career goals and how this opportunity will help you achieve them')}
                required
                style={{ width: '100%', resize: 'vertical' }}
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6">
            <h1 style={{
              fontSize: 'clamp(16px, 4vw, 28px)',
              fontWeight: '700',
              overflowWrap: 'break-word',
              wordBreak: 'break-word',
              whiteSpace: 'normal',
              maxWidth: '100%',
              lineHeight: '1.3',
              margin: '0 0 8px 0',
            }}>Application Details</h1>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  {t('Cover Letter')} *
                </label>
                <textarea
                  name="cover_letter"
                  value={formData.cover_letter}
                  onChange={handleChange}
                  rows={12}
                  className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  placeholder={t('Why are you applying?')}
                  required
                />
                <p className="text-xs text-neutral-500 mt-1">
                  {formData.cover_letter.length} characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  {t('Resume/CV')} ({t('Optional')})
                </label>
                <div className="border-2 border-dashed border-neutral-200 rounded-lg p-6 text-center hover:border-primary-400 transition-colors">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setResume(e.target.files?.[0] || null)}
                    className="hidden"
                    id="resume-upload"
                  />
                  <label htmlFor="resume-upload" className="cursor-pointer">
                    <Upload className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                    {resume ? (
                      <p className="text-sm text-neutral-700 font-medium">{resume.name}</p>
                    ) : (
                      <>
                        <p className="text-sm text-neutral-700 font-medium">{t('Click to upload resume')}</p>
                        <p className="text-xs text-neutral-500 mt-1">PDF, DOC, DOCX (Max 5MB)</p>
                      </>
                    )}
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: '12px',
            width: '100%',
            maxWidth: '100%',
            boxSizing: 'border-box',
            justifyContent: 'flex-end',
            alignItems: 'stretch',
            marginTop: '24px',
          }}>
            <button
              type="button"
              onClick={() => navigate('/opportunities')}
              style={{
                padding: '12px 20px',
                background: 'white',
                color: '#374151',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: 'clamp(13px, 3vw, 16px)',
                fontWeight: '500',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                boxSizing: 'border-box',
                minHeight: '48px',
                flexShrink: 0,
              }}
            >
              {t('Cancel')}
            </button>
            <button
              type="submit"
              disabled={submitMutation.isPending}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '12px 20px',
                background: submitMutation.isPending ? '#9CA3AF' : '#10B981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: 'clamp(13px, 3vw, 16px)',
                fontWeight: '600',
                cursor: submitMutation.isPending ? 'not-allowed' : 'pointer',
                whiteSpace: 'normal',
                wordBreak: 'break-word',
                width: '100%',
                maxWidth: '180px',
                boxSizing: 'border-box',
                minHeight: '48px',
                textAlign: 'center',
                lineHeight: '1.3',
                gap: '8px',
                opacity: submitMutation.isPending ? 0.5 : 1,
              }}
            >
              {submitMutation.isPending ? (
                t('Submitting...')
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  {t('Submit Application')}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};
