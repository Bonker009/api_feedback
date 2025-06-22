"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { listSpecs, deleteSpec } from "@/lib/data-service";
import {
  FileText,
  Plus,
  Upload,
  BarChart,
  GraduationCap,
  Users,
  Award,
  Code,
  Globe,
  Rocket,
  BookOpen,
  Star,
  ExternalLink,
  TestTube,
  Database,
  Zap,
} from "lucide-react";

type ApiSpec = {
  id: string;
  title: string;
  version: string;
  lastModified: string;
};

export default function Home() {
  const [specs, setSpecs] = useState<ApiSpec[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSpecs() {
      try {
        setLoading(true);
        const specsList = await listSpecs();
        setSpecs(specsList);
      } catch (error) {
        console.error("Failed to load specs:", error);
      } finally {
        setLoading(false);
      }
    }

    loadSpecs();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this API specification?")) {
      try {
        await deleteSpec(id);
        setSpecs((prev) => prev.filter((spec) => spec.id !== id));
      } catch (error) {
        alert("Failed to delete specification.");
      }
    }
  };

  const features = [
    {
      icon: FileText,
      title: "API Documentation",
      description:
        "Generate and manage comprehensive API documentation from OpenAPI specifications",
      link: "/documentation",
      color: "blue",
    },
    {
      icon: TestTube,
      title: "Endpoint Testing",
      description:
        "Automated testing suite for API endpoints with real-time results and reporting",
      link: "/documentation/test-endpoints",
      color: "green",
    },
    {
      icon: Upload,
      title: "Spec Management",
      description:
        "Upload, validate, and organize your OpenAPI specifications in one place",
      link: "/upload",
      color: "purple",
    },
    {
      icon: Zap,
      title: "Real-time Validation",
      description:
        "Instant validation and error detection for your API specifications",
      link: "#",
      color: "yellow",
    },
  ];

  const stats = [
    { label: "API Specifications", value: specs.length, icon: FileText },
    { label: "Active Projects", value: "12+", icon: Code },
    { label: "Students Trained", value: "500+", icon: Users },
    { label: "Success Rate", value: "98%", icon: Award },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="flex flex-col">
        <div className="flex-1 p-6">
          {/* Hero Section */}
          <div className="max-w-6xl mx-auto mb-12">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="p-3 bg-blue-600 rounded-xl">
                  <GraduationCap className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  KSHRD Center
                </h1>
              </div>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Korea Software HRD Center - Empowering the next generation of
                software developers in Cambodia through world-class training
                programs and cutting-edge technology platforms.
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {stats.map((stat, index) => (
                <Card
                  key={index}
                  className="border-0 shadow-lg bg-white/70 backdrop-blur-sm"
                >
                  <CardContent className="p-4 text-center">
                    <stat.icon className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* About Section */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm mb-8">
              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      Building Cambodia's Tech Future
                    </h2>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      KSHRD Center is a leading software development training
                      institution in Cambodia, established through a partnership
                      with Korea to bridge the digital skills gap and foster
                      innovation in Southeast Asia.
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                        <Code className="h-3 w-3 mr-1" />
                        Software Development
                      </Badge>
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        <Globe className="h-3 w-3 mr-1" />
                        Global Standards
                      </Badge>
                      <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                        <Rocket className="h-3 w-3 mr-1" />
                        Innovation Hub
                      </Badge>
                    </div>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Learn More About KSHRD
                    </Button>
                  </div>
                  <div className="relative">
                    <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
                      <h3 className="text-lg font-semibold mb-4">
                        Our Mission
                      </h3>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <Star className="h-4 w-4" />
                          Provide world-class software training
                        </li>
                        <li className="flex items-center gap-2">
                          <Star className="h-4 w-4" />
                          Foster innovation and entrepreneurship
                        </li>
                        <li className="flex items-center gap-2">
                          <Star className="h-4 w-4" />
                          Bridge technology gaps in Cambodia
                        </li>
                        <li className="flex items-center gap-2">
                          <Star className="h-4 w-4" />
                          Create sustainable tech ecosystem
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* KSHRD Achievements & Programs */}
            <div className="mb-12">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  KSHRD Center Achievements & Programs
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Over a decade of excellence in technology education and
                  digital transformation in Cambodia.
                </p>
              </div>

              {/* Achievement Timeline */}
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm mb-8">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Award className="h-6 w-6 text-yellow-600" />
                    </div>
                    <CardTitle className="text-xl">
                      Major Achievements & Milestones
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="flex gap-4">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            2013 - Foundation
                          </h4>
                          <p className="text-sm text-gray-600">
                            Established as Korea Software HRD Center in
                            collaboration with Korean government and industry
                            partners.
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            2016 - First Graduation
                          </h4>
                          <p className="text-sm text-gray-600">
                            First cohort of 30 students graduated with 95%
                            employment rate in top tech companies.
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            2019 - Regional Recognition
                          </h4>
                          <p className="text-sm text-gray-600">
                            Recognized as "Best IT Training Center" by ASEAN
                            Digital Innovation Awards.
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            2021 - 500+ Graduates
                          </h4>
                          <p className="text-sm text-gray-600">
                            Reached milestone of 500+ skilled developers
                            contributing to Cambodia's digital economy.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="relative">
                      <img
                        src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=500&h=300&fit=crop&crop=center"
                        alt="KSHRD Center classroom with students learning programming"
                        className="w-full h-64 object-cover rounded-lg shadow-lg"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-lg"></div>
                      <div className="absolute bottom-4 left-4 text-white">
                        <p className="text-sm font-medium">
                          Modern Learning Environment
                        </p>
                        <p className="text-xs opacity-90">
                          State-of-the-art facilities for hands-on learning
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Training Programs */}
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="relative mb-4">
                      <img
                        src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=200&fit=crop&crop=center"
                        alt="Web Development Course"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-blue-100 text-blue-800">
                          6 Months
                        </Badge>
                      </div>
                    </div>
                    <h3 className="font-bold text-lg mb-2">Web Development</h3>
                    <p className="text-gray-600 text-sm mb-3">
                      Full-stack web development using modern frameworks like
                      React, Node.js, and MongoDB.
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        120+ Graduates
                      </span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star
                            key={i}
                            className="h-3 w-3 fill-yellow-400 text-yellow-400"
                          />
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="relative mb-4">
                      <img
                        src="https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=200&fit=crop&crop=center"
                        alt="Mobile Development Course"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-green-100 text-green-800">
                          8 Months
                        </Badge>
                      </div>
                    </div>
                    <h3 className="font-bold text-lg mb-2">
                      Mobile Development
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">
                      iOS and Android app development using Swift, Kotlin, and
                      cross-platform frameworks.
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        90+ Graduates
                      </span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star
                            key={i}
                            className="h-3 w-3 fill-yellow-400 text-yellow-400"
                          />
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="relative mb-4">
                      <img
                        src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200&fit=crop&crop=center"
                        alt="Data Science Course"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-purple-100 text-purple-800">
                          10 Months
                        </Badge>
                      </div>
                    </div>
                    <h3 className="font-bold text-lg mb-2">
                      Data Science & AI
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">
                      Machine learning, data analysis, and AI development using
                      Python and advanced algorithms.
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        75+ Graduates
                      </span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star
                            key={i}
                            className="h-3 w-3 fill-yellow-400 text-yellow-400"
                          />
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Success Stories */}
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm mb-8">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Users className="h-6 w-6 text-green-600" />
                    </div>
                    <CardTitle className="text-xl">Success Stories</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <img
                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
                        alt="Sophea Chea - Software Engineer at Google"
                        className="w-20 h-20 rounded-full mx-auto mb-4 object-cover"
                      />
                      <h4 className="font-semibold">Sophea Chea</h4>
                      <p className="text-sm text-blue-600 mb-2">
                        Software Engineer @ Google
                      </p>
                      <p className="text-xs text-gray-600">
                        "KSHRD transformed my career. From a fresh graduate to
                        working at Google in just 2 years."
                      </p>
                    </div>
                    <div className="text-center">
                      <img
                        src="https://images.unsplash.com/photo-1494790108755-2616b612b372?w=150&h=150&fit=crop&crop=face"
                        alt="Dara Lim - Tech Startup Founder"
                        className="w-20 h-20 rounded-full mx-auto mb-4 object-cover"
                      />
                      <h4 className="font-semibold">Dara Lim</h4>
                      <p className="text-sm text-green-600 mb-2">
                        Founder @ TechCambo
                      </p>
                      <p className="text-xs text-gray-600">
                        "The entrepreneurship program helped me launch a
                        successful fintech startup serving 10K+ users."
                      </p>
                    </div>
                    <div className="text-center">
                      <img
                        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
                        alt="Pisach Vong - Senior Developer at Samsung"
                        className="w-20 h-20 rounded-full mx-auto mb-4 object-cover"
                      />
                      <h4 className="font-semibold">Pisach Vong</h4>
                      <p className="text-sm text-purple-600 mb-2">
                        Senior Dev @ Samsung
                      </p>
                      <p className="text-xs text-gray-600">
                        "The hands-on approach and real-world projects prepared
                        me for challenges in the tech industry."
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Industry Partnerships */}
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm mb-8">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Globe className="h-6 w-6 text-blue-600" />
                    </div>
                    <CardTitle className="text-xl">
                      Industry Partnerships
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-semibold mb-4">
                        Global Technology Partners
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">
                            MS
                          </div>
                          <span className="text-sm font-medium">Microsoft</span>
                        </div>
                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                          <div className="w-8 h-8 bg-red-500 rounded flex items-center justify-center text-white text-xs font-bold">
                            G
                          </div>
                          <span className="text-sm font-medium">Google</span>
                        </div>
                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                          <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center text-white text-xs font-bold">
                            A
                          </div>
                          <span className="text-sm font-medium">Amazon</span>
                        </div>
                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                          <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center text-white text-xs font-bold">
                            S
                          </div>
                          <span className="text-sm font-medium">Samsung</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <img
                        src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=500&h=300&fit=crop&crop=center"
                        alt="KSHRD Center partnership signing ceremony"
                        className="w-full h-48 object-cover rounded-lg shadow-lg"
                      />
                      <p className="text-sm text-gray-600 mt-2 text-center">
                        Partnership signing ceremony with international tech
                        companies
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Impact Statistics */}
              <Card className="border-0 shadow-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold mb-2">
                      Our Impact in Numbers
                    </h3>
                    <p className="opacity-90">
                      Transforming lives and building Cambodia's digital future
                    </p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold mb-1">500+</div>
                      <div className="text-sm opacity-90">Graduates</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold mb-1">98%</div>
                      <div className="text-sm opacity-90">Employment Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold mb-1">25+</div>
                      <div className="text-sm opacity-90">
                        Partner Companies
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold mb-1">$2.5M</div>
                      <div className="text-sm opacity-90">
                        Avg Graduate Salary
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Poseidon Platform Section */}
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Poseidon API Platform
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Our comprehensive API development and testing platform, built to
                support modern software development workflows.
              </p>
            </div>

            {/* Platform Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              {features.map((feature, index) => (
                <Card
                  key={index}
                  className={`border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm hover:-translate-y-1`}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          feature.color === "blue"
                            ? "bg-blue-100 text-blue-600"
                            : feature.color === "green"
                              ? "bg-green-100 text-green-600"
                              : feature.color === "purple"
                                ? "bg-purple-100 text-purple-600"
                                : "bg-yellow-100 text-yellow-600"
                        }`}
                      >
                        <feature.icon className="h-5 w-5" />
                      </div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600 mb-4 leading-relaxed">
                      {feature.description}
                    </CardDescription>
                    <Link href={feature.link}>
                      <Button
                        variant="outline"
                        size="sm"
                        className={`${
                          feature.color === "blue"
                            ? "border-blue-200 text-blue-600 hover:bg-blue-50"
                            : feature.color === "green"
                              ? "border-green-200 text-green-600 hover:bg-green-50"
                              : feature.color === "purple"
                                ? "border-purple-200 text-purple-600 hover:bg-purple-50"
                                : "border-yellow-200 text-yellow-600 hover:bg-yellow-50"
                        }`}
                      >
                        Explore Feature
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* API Specifications Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle>API Documentation</CardTitle>
                      <CardDescription>
                        Manage and explore your API specifications
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-3">
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                    </div>
                  ) : specs.length > 0 ? (
                    <div className="space-y-3">
                      {specs.slice(0, 3).map((spec) => (
                        <div
                          key={spec.id}
                          className="border rounded-lg overflow-hidden bg-white"
                        >
                          <div className="p-4 flex flex-col md:flex-row md:items-center justify-between">
                            <div className="flex items-center mb-2 md:mb-0">
                              <FileText className="h-4 w-4 mr-3 text-blue-500" />
                              <div>
                                <div className="font-medium text-sm">
                                  {spec.title}
                                </div>
                                <div className="text-xs text-gray-500">
                                  Version: {spec.version}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Link href={`/documentation/${spec.id}`}>
                                <Button
                                  size="sm"
                                  className="bg-blue-600 hover:bg-blue-700 text-xs"
                                >
                                  View Docs
                                </Button>
                              </Link>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-red-300 text-red-500 hover:bg-red-50 text-xs"
                                onClick={() => handleDelete(spec.id)}
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                      {specs.length > 3 && (
                        <div className="text-center pt-2">
                          <Link href="/documentation">
                            <Button variant="outline" size="sm">
                              View All ({specs.length}) Specifications
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 border-2 border-dashed rounded-lg">
                      <FileText className="h-8 w-8 mx-auto mb-3 text-gray-400" />
                      <p className="text-gray-500 mb-4 text-sm">
                        No API specifications found
                      </p>
                      <Link href="/upload">
                        <Button className="bg-blue-600 hover:bg-blue-700">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Your First Specification
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Rocket className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <CardTitle>Quick Start</CardTitle>
                      <CardDescription>
                        Get started with the Poseidon platform
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <Link href="/upload">
                      <Button className="w-full justify-start bg-purple-600 hover:bg-purple-700">
                        <Upload className="h-4 w-4 mr-3" />
                        Upload API Specification
                      </Button>
                    </Link>

                    <Link href="/documentation/test-endpoints">
                      <Button
                        variant="outline"
                        className="w-full justify-start border-green-200 text-green-600 hover:bg-green-50"
                      >
                        <TestTube className="h-4 w-4 mr-3" />
                        Test API Endpoints
                      </Button>
                    </Link>

                    <Link href="/documentation">
                      <Button
                        variant="outline"
                        className="w-full justify-start border-blue-200 text-blue-600 hover:bg-blue-50"
                      >
                        <BookOpen className="h-4 w-4 mr-3" />
                        Browse Documentation
                      </Button>
                    </Link>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-medium text-sm mb-2 text-gray-900">
                      Platform Statistics
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="text-center p-2 bg-blue-50 rounded">
                        <div className="font-bold text-blue-600">
                          {specs.length}
                        </div>
                        <div className="text-blue-600">API Specs</div>
                      </div>
                      <div className="text-center p-2 bg-green-50 rounded">
                        <div className="font-bold text-green-600">Active</div>
                        <div className="text-green-600">Platform</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
