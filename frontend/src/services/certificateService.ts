import { apiClient } from "./apiClient";

export interface Certificate {
  id: string;
  user_id: string;
  project_id?: string;
  title: string;
  file_name: string;
  file_path: string;
  file_size: number;
  status: string;
  certificate_type: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

interface CertificateListResponse {
  certificates: Certificate[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface CreateCertificateRequest {
  project_id?: string;
  title: string;
  file_name: string;
  file_path: string;
  file_size: number;
  certificate_type?: string;
  metadata?: any;
}

export interface CertificateService {
  /**
   * Get all certificates for the authenticated user
   */
  getCertificates: (
    page?: number,
    limit?: number,
    status?: string,
    certificate_type?: string
  ) => Promise<CertificateListResponse>;

  /**
   * Get a specific certificate by ID
   */
  getCertificateById: (id: string) => Promise<Certificate>;

  /**
   * Create a new certificate
   */
  createCertificate: (data: CreateCertificateRequest) => Promise<Certificate>;

  /**
   * Update an existing certificate
   */
  updateCertificate: (
    id: string,
    data: Partial<Certificate>
  ) => Promise<Certificate>;

  /**
   * Delete a certificate
   */
  deleteCertificate: (id: string) => Promise<{ message: string }>;

  /**
   * Download a certificate
   */
  downloadCertificate: (id: string) => Promise<{ url: string }>;
}

class CertificateServiceImpl implements CertificateService {
  async getCertificates(
    page = 1,
    limit = 10,
    status?: string,
    certificate_type?: string
  ): Promise<CertificateListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (status) {
      params.append("status", status);
    }

    if (certificate_type) {
      params.append("certificate_type", certificate_type);
    }

    const response = await apiClient.get(
      `/api/authorship/certificates?${params.toString()}`
    );
    return response;
  }

  async getCertificateById(id: string): Promise<Certificate> {
    const response = await apiClient.get(`/api/authorship/certificates/${id}`);
    return response;
  }

  async createCertificate(
    data: CreateCertificateRequest
  ): Promise<Certificate> {
    const response = await apiClient.post("/api/authorship/certificates", data);
    return response;
  }

  async updateCertificate(
    id: string,
    data: Partial<Certificate>
  ): Promise<Certificate> {
    const response = await apiClient.put(
      `/api/authorship/certificates/${id}`,
      data
    );
    return response;
  }

  async deleteCertificate(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete(
      `/api/authorship/certificates/${id}`,
      {}
    );
    return response;
  }

  async downloadCertificate(id: string): Promise<{ url: string }> {
    const response = await apiClient.get(
      `/api/authorship/certificates/${id}/download`
    );
    return response;
  }
}

export default new CertificateServiceImpl();
